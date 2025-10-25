import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { CreateItemRequest, ItemType, ItemStatus } from '../../models/item.model';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  addItemForm!: FormGroup;
  loading = false;
  error = '';
  success = false;

  // Enums para los select
  itemTypes = [
    { value: 'Libro', label: 'Libro' },
    { value: 'Manga', label: 'Manga' }
  ];

  itemStatuses = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Leyendo', label: 'Leyendo' },
    { value: 'Terminado', label: 'Terminado' }
  ];

  ratings = [1, 2, 3, 4, 5];
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addItemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      author: ['', [Validators.required, Validators.minLength(1)]],
      type: ['Libro', [Validators.required]],
      genre: [''],
      language: ['Español'],
      publication_year: [''],
      status: ['Pendiente', [Validators.required]],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      notes: [''],
      cover_url: ['', [Validators.pattern('https?://.+')]]
    });
  }

  onSubmit() {
    if (this.addItemForm.valid && !this.loading) {
      this.loading = true;
      this.error = '';

      const formData = this.addItemForm.value;
      
      // Crear el objeto según tu modelo
      const newItem: CreateItemRequest = {
        title: formData.title,
        author: formData.author,
        type: formData.type as ItemType,
        genre: formData.genre || '',
        language: formData.language || 'Español',
        publication_year: formData.publication_year || '',
        status: formData.status as ItemStatus,
        rating: formData.rating ? parseInt(formData.rating) : null,
        notes: formData.notes || '',
        cover_url: formData.cover_url || ''
      };

      this.itemService.createItem(newItem).subscribe({
        next: (response) => {
          console.log('Item creado exitosamente:', response);
          this.success = true;
          this.loading = false;
          
          // Redirigir a la biblioteca después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/library']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al crear item:', error);
          this.error = 'Error al crear el item. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.addItemForm.controls).forEach(key => {
        this.addItemForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.router.navigate(['/library']);
  }

  // Helper methods para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addItemForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.addItemForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} es muy corto`;
      if (field.errors['min']) return `Valor mínimo no válido`;
      if (field.errors['max']) return `Valor máximo no válido`;
      if (field.errors['pattern']) return `Formato no válido`;
    }
    return '';
  }
}