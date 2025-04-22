export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  storeId: string;
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
  categoryId: string;
}

export interface MenuItemImageData {
  imageUrl: string;
} 