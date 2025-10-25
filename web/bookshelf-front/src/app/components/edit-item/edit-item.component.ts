import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item, CreateItemRequest, Tag, ItemType, ItemStatus } from '../../models/item.model';

@Component({
  selector: 'app-edit-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css']
})
export class EditItemComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  currentItem: Item | null = null;
  availableTags: Tag[] = [];
  selectedTags: number[] = [];
  isLoading = false;
  isSubmitting = false;
  itemId: number | null = null;

  // Opciones para los selects
  itemTypes: ItemType[] = ['Libro', 'Manga'];
  itemStatuses: ItemStatus[] = ['Leyendo', 'Terminado', 'Pendiente'];
  ratingOptions = [1, 2, 3, 4, 5];

  // Para unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener el ID del item de la ruta
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.itemId = params['id'] ? parseInt(params['id']) : null;
      if (this.itemId) {
        this.loadItem();
      } else {
        this.router.navigate(['/library']);
      }
    });

    // Inicializar formulario
    this.initForm();

    // Cargar tags disponibles
    this.loadTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar formulario
   */
  private initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      genre: ['', Validators.maxLength(50)],
      language: ['', Validators.maxLength(30)],
      publication_year: ['', Validators.pattern(/^\d{4}$/)],
      status: ['', Validators.required],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      notes: ['', Validators.maxLength(1000)],
      cover_url: ['', Validators.maxLength(500)]
    });
  }

  /**
   * Cargar item para editar
   */
  private loadItem(): void {
    if (!this.itemId) return;

    this.isLoading = true;
    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.currentItem = item;
        this.populateForm(item);
        this.selectedTags = item.tags ? item.tags.map(tag => tag.id) : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando item:', error);
        this.isLoading = false;
        alert('Error al cargar el item');
        this.router.navigate(['/library']);
      }
    });
  }

  /**
   * Poblar formulario con datos del item
   */
  private populateForm(item: Item): void {
    this.editForm.patchValue({
      title: item.title,
      author: item.author,
      type: item.type,
      genre: item.genre,
      language: item.language,
      publication_year: item.publication_year,
      status: item.status,
      rating: item.rating || null,
      notes: item.notes,
      cover_url: item.cover_url
    });
  }

  /**
   * Cargar tags disponibles
   */
  private loadTags(): void {
    this.itemService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (error) => {
        console.error('Error cargando tags:', error);
      }
    });
  }

  /**
   * Toggle selección de tag
   */
  toggleTag(tagId: number): void {
    const index = this.selectedTags.indexOf(tagId);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagId);
    }
  }

  /**
   * Verificar si un tag está seleccionado
   */
  isTagSelected(tagId: number): boolean {
    return this.selectedTags.includes(tagId);
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (this.editForm.valid && this.itemId) {
      this.isSubmitting = true;

      const formValue = this.editForm.value;
      const updateData: Partial<CreateItemRequest> = {
        title: formValue.title,
        author: formValue.author,
        type: formValue.type,
        genre: formValue.genre || undefined,
        language: formValue.language || undefined,
        publication_year: formValue.publication_year || undefined,
        status: formValue.status,
        rating: formValue.rating || null,
        notes: formValue.notes || undefined,
        cover_url: formValue.cover_url || undefined,
        tags_ids: this.selectedTags.length > 0 ? this.selectedTags : undefined
      };

      this.itemService.updateItem(this.itemId, updateData).subscribe({
        next: (updatedItem) => {
          console.log('Item actualizado exitosamente:', updatedItem);
          this.isSubmitting = false;
          this.router.navigate(['/library']);
        },
        error: (error) => {
          console.error('Error actualizando item:', error);
          this.isSubmitting = false;
          
          // Mostrar mensaje de error más específico
          if (error.status === 400) {
            alert('Error: Datos inválidos. Verifica los campos del formulario.');
          } else if (error.status === 401) {
            alert('Error: No tienes permisos para actualizar este item.');
          } else if (error.status === 404) {
            alert('Error: El item no fue encontrado.');
          } else {
            alert('Error al actualizar el item. Inténtalo de nuevo.');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${this.getFieldDisplayName(fieldName)} no debe exceder ${maxLength} caracteres`;
    }
    if (field.hasError('pattern')) {
      if (fieldName === 'publication_year') {
        return 'El año debe ser un número de 4 dígitos';
      }
    }
    if (field.hasError('min') || field.hasError('max')) {
      if (fieldName === 'rating') {
        return 'La calificación debe estar entre 1 y 5';
      }
    }

    return '';
  }

  /**
   * Obtener nombre de campo para mostrar
   */
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      title: 'Título',
      author: 'Autor',
      type: 'Tipo',
      genre: 'Género',
      language: 'Idioma',
      publication_year: 'Año de publicación',
      status: 'Estado',
      rating: 'Calificación',
      notes: 'Notas',
      cover_url: 'URL de la portada'
    };
    return fieldNames[fieldName] || fieldName;
  }

  /**
   * Cancelar edición
   */
  cancel(): void {
    this.router.navigate(['/library']);
  }

  /**
   * Obtener array de estrellas para rating preview
   */
  getStars(rating: number | null): number[] {
    const ratingValue = rating || 0;
    return Array(5).fill(0).map((_, i) => i < ratingValue ? 1 : 0);
  }

  /**
   * Crear nueva tag
   */
  createNewTag(): void {
    const tagName = prompt('Nombre de la nueva tag:');
    if (tagName && tagName.trim()) {
      this.itemService.createTag(tagName.trim()).subscribe({
        next: (newTag) => {
          this.availableTags.push(newTag);
          this.selectedTags.push(newTag.id);
        },
        error: (error) => {
          console.error('Error creando tag:', error);
          alert('Error al crear la tag');
        }
      });
    }
  }
}