import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-view-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-item.component.html',
  styleUrls: ['./view-item.component.css']
})
export class ViewItemComponent implements OnInit, OnDestroy {
  currentItem: Item | null = null;
  isLoading = false;
  itemId: number | null = null;

  // Para unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar item para visualizar
   */
  private loadItem(): void {
    if (!this.itemId) return;

    this.isLoading = true;
    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.currentItem = item;
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
   * Ir a editar item
   */
  editItem(): void {
    if (this.currentItem) {
      this.router.navigate(['/library/edit', this.currentItem.ID]);
    }
  }

  /**
   * Eliminar item
   */
  deleteItem(): void {
    if (!this.currentItem) return;

    if (confirm(`¿Estás seguro de que quieres eliminar "${this.currentItem.title}"?`)) {
      this.itemService.deleteItem(this.currentItem.ID).subscribe({
        next: () => {
          console.log('Item eliminado exitosamente');
          this.router.navigate(['/library']);
        },
        error: (error) => {
          console.error('Error eliminando item:', error);
          alert('Error al eliminar el item');
        }
      });
    }
  }

  /**
   * Volver a la biblioteca
   */
  goBack(): void {
    this.router.navigate(['/library']);
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
      case 'Leyendo': return '#007bff';
      case 'Terminado': return '#28a745';
      case 'Pendiente': return '#ffc107';
      default: return '#6c757d';
    }
  }

  /**
   * Obtener color de tipo
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'Libro': return '#17a2b8';
      case 'Manga': return '#e83e8c';
      default: return '#6c757d';
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Verificar si hay notas
   */
  hasNotes(): boolean {
    return !!(this.currentItem?.notes && this.currentItem.notes.trim().length > 0);
  }
}