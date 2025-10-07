export interface TranslatableText {
  en: string;
  ne: string;
}

export interface Album {
  id: string;
  name: TranslatableText;
  description?: TranslatableText;
  isActive: boolean;
  coverMediaId?: string;
  coverMediaUrl?: string;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumMediaItem {
  id: string;
  albumId: string;
  mediaId: string;
  title?: string;
  position: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface AlbumQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AlbumListResponse {
  data: Album[];
  pagination: PaginationInfo;
}

export interface AlbumFormData {
  name: TranslatableText;
  description: TranslatableText;
  isActive: boolean;
}


