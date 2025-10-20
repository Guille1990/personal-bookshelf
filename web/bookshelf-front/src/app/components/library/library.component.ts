import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item, ItemFilters, Tag } from '../../models/item.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  filteredItems: Item[] = [];
  tags: Tag[] = [];
  isLoading = false;
  currentUser: any = null;
  
  // Formulario de filtros
  filterForm!: FormGroup;
  
  // Control de vista
  viewMode: 'grid' | 'list' = 'grid';
  
  // Para unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private itemService: ItemService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Inicializar formulario de filtros
    this.initFilterForm();

    // Suscribirse a cambios en items y loading
    combineLatest([
      this.itemService.items$,
      this.itemService.loading$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([items, loading]) => {
      console.log('Items updated:', items, 'Loading:', loading); // Debug log
      this.items = items;
      this.filteredItems = items;
      this.isLoading = loading;
    });

    // Cargar datos iniciales
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar formulario de filtros
   */
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      title: [''],
      author: [''],
      type: [''],
      genre: [''],
      status: [''],
      rating: ['']
    });

    // Aplicar filtros cuando cambien
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  /**
   * Cargar datos iniciales
   */
  private loadData(): void {
    console.log('Loading data...'); // Debug log
    
    this.itemService.getItems().subscribe({
      next: (items) => {
        console.log('Items loaded:', items); // Debug log
        // Los items se actualizan automáticamente via el observable
      },
      error: (error) => {
        console.error('Error cargando items:', error);
        this.isLoading = false; // Asegurar que el loading se detenga en caso de error
      }
    });

    this.itemService.getTags().subscribe({
      next: (tags) => {
        console.log('Tags loaded:', tags); // Debug log
        this.tags = tags;
      },
      error: (error) => {
        console.error('Error cargando tags:', error);
      }
    });
  }

  /**
   * Aplicar filtros localmente
   */
  private applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredItems = this.items.filter(item => {
      return (
        (!filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.author || item.author.toLowerCase().includes(filters.author.toLowerCase())) &&
        (!filters.type || item.type === filters.type) &&
        (!filters.genre || item.genre.toLowerCase().includes(filters.genre.toLowerCase())) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.rating || item.rating >= parseInt(filters.rating))
      );
    });
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.filterForm.reset();
  }

  /**
   * Cambiar modo de vista
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  /**
   * Eliminar item
   */
  deleteItem(item: Item): void {
    if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
      this.itemService.deleteItem(item.id).subscribe({
        next: () => {
          console.log('Item eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error eliminando item:', error);
          alert('Error al eliminar el item');
        }
      });
    }
  }

  /**
   * Ir a agregar nuevo item
   */
  addNewItem(): void {
    this.router.navigate(['/library/add']);
  }

  /**
   * Ir a editar item
   */
  editItem(item: Item): void {
    this.router.navigate(['/library/edit', item.id]);
  }

  /**
   * Ver detalles del item
   */
  viewItem(item: Item): void {
    this.router.navigate(['/library/view', item.id]);
  }

  /**
   * Obtener array de estrellas para rating
   */
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  /**
   * Obtener color por estado
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Leyendo': return 'blue';
      case 'Terminado': return 'green';
      case 'Pendiente': return 'orange';
      default: return 'gray';
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return this.itemService.getStats();
  }

  /**
   * Ir al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Método temporal para debuggear
   */
  forceRefresh(): void {
    console.log('Force refresh clicked');
    this.isLoading = true;
    this.itemService.refreshItems();
  }
}