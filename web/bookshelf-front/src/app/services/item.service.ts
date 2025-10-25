import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Item, CreateItemRequest, UpdateItemRequest, ItemsResponse, ItemFilters, Tag } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private baseUrl = '/api';
  
  // Estado reactivo para la lista de items
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  // Estado para loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los items del usuario
   */
  getItems(filters?: ItemFilters): Observable<Item[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/items`, { params })
      .pipe(
        tap(response => {
          console.log('API Response:', response); // Debug log
          
          // Manejar diferentes estructuras de respuesta
          let items: Item[] = [];
          if (Array.isArray(response)) {
            // Si la respuesta es un array directo
            items = response;
          } else if (response && response.items && Array.isArray(response.items)) {
            // Si la respuesta tiene una propiedad 'items'
            items = response.items;
          } else if (response && Array.isArray(response.data)) {
            // Si la respuesta tiene una propiedad 'data'
            items = response.data;
          }
          
          console.log('Processed items:', items); // Debug log
          this.itemsSubject.next(items);
          this.loadingSubject.next(false);
        }),
        // Transformar la respuesta para que siempre devuelva un array
        map((response: any) => {
          if (Array.isArray(response)) {
            return response;
          } else if (response && response.items && Array.isArray(response.items)) {
            return response.items;
          } else if (response && Array.isArray(response.data)) {
            return response.data;
          }
          return [];
        }),
        // Manejar errores
        catchError(error => {
          console.error('Error loading items:', error);
          this.loadingSubject.next(false);
          this.itemsSubject.next([]);
          throw error;
        })
      );
  }

  /**
   * Obtener un item por ID
   */
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/items/${id}`);
  }

  /**
   * Crear nuevo item
   */
  createItem(item: CreateItemRequest): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/items`, item)
      .pipe(
        tap(() => {
          // Recargar la lista después de crear
          this.refreshItems();
        })
      );
  }

  /**
   * Actualizar item existente
   */
  updateItem(id: number, item: Partial<CreateItemRequest>): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/items/${id}`, item)
      .pipe(
        tap(() => {
          // Recargar la lista después de actualizar
          this.refreshItems();
        })
      );
  }

  /**
   * Eliminar item
   */
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`)
      .pipe(
        tap(() => {
          // Actualizar la lista eliminando el item
          const currentItems = this.itemsSubject.value;
          const updatedItems = currentItems.filter(item => item.ID !== id);
          this.itemsSubject.next(updatedItems);
        })
      );
  }

  /**
   * Filtrar items por tags
   */
  filterItemsByTags(tagIds: number[]): Observable<Item[]> {
    let params = new HttpParams();
    tagIds.forEach(id => params = params.append('tag_ids', id.toString()));
    
    return this.http.get<Item[]>(`${this.baseUrl}/items/filter`, { params });
  }

  /**
   * Obtener todas las tags
   */
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }

  /**
   * Crear nueva tag
   */
  createTag(name: string): Observable<Tag> {
    return this.http.post<Tag>(`${this.baseUrl}/tags`, { name });
  }

  /**
   * Refrescar la lista de items
   */
  refreshItems(): void {
    this.getItems().subscribe();
  }

  /**
   * Obtener estadísticas rápidas
   */
  getStats(): { total: number; libros: number; mangas: number; leyendo: number; terminados: number; pendientes: number } {
    const items = this.itemsSubject.value;
    return {
      total: items.length,
      libros: items.filter(item => item.type === 'Libro').length,
      mangas: items.filter(item => item.type === 'Manga').length,
      leyendo: items.filter(item => item.status === 'Leyendo').length,
      terminados: items.filter(item => item.status === 'Terminado').length,
      pendientes: items.filter(item => item.status === 'Pendiente').length
    };
  }
}