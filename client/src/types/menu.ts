export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  storeId: number;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategoryFormData {
  name: string;
  description?: string;
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  storeId: number;
}

export interface MenuItemImageData {
  imageUrl: string;
} 