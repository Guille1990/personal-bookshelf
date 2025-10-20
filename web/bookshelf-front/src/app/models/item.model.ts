export interface Item {
  id: number;
  user_id: number;
  title: string;
  author: string;
  type: 'Libro' | 'Manga';
  genre: string;
  language: string;
  publication_year: number;
  status: 'Leyendo' | 'Terminado' | 'Pendiente';
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
  type: 'Libro' | 'Manga';
  genre: string;
  language: string;
  publication_year: number;
  status: 'Leyendo' | 'Terminado' | 'Pendiente';
  rating: number;
  notes: string;
  cover_url?: string;
  tag_ids?: number[];
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
  type?: 'Libro' | 'Manga';
  genre?: string;
  status?: 'Leyendo' | 'Terminado' | 'Pendiente';
  rating?: number;
  tags?: number[];
  page?: number;
  per_page?: number;
}