// Types
export type ItemType = 'Libro' | 'Manga';
export type ItemStatus = 'Leyendo' | 'Terminado' | 'Pendiente';

export interface Item {
  ID: number;
  user_id: number;
  title: string;
  author: string;
  type: ItemType;
  genre: string;
  language: string;
  publication_year: string;
  status: ItemStatus;
  rating: number; // 1-5
  notes: string;
  cover_url: string;
  created_at: string;
  updated_at?: string;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface CreateItemRequest {
  title: string;
  author: string;
  type: ItemType;
  genre?: string;
  language?: string;
  publication_year?: string;
  status: ItemStatus;
  rating?: number | null;
  notes?: string;
  cover_url?: string;
  tags_ids?: number[];
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  id: number;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page?: number;
  per_page?: number;
}

// Filtros para búsqueda
export interface ItemFilters {
  title?: string;
  author?: string;
  type?: ItemType;
  genre?: string;
  status?: ItemStatus;
  rating?: number;
  tags?: number[];
  page?: number;
  per_page?: number;
}