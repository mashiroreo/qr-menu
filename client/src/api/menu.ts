import api from './axios';
import {
  MenuCategory,
  MenuItem,
  MenuItemFormData,
} from '../types/menu';

export const getCategories = async (): Promise<MenuCategory[]> => {
  const response = await api.get('/api/menu/categories');
  return response.data;
};

export const createCategory = async (data: {
  name: string;
  description?: string;
}): Promise<MenuCategory> => {
  const response = await api.post('/api/menu/categories', data);
  return response.data;
};

export const updateCategory = async (
  id: number,
  data: { name: string; description?: string }
): Promise<MenuCategory> => {
  const response = await api.put(`/api/menu/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/menu/categories/${id}`);
};

// メニューアイテム関連のAPI
export const getMenuItems = async (categoryId: number): Promise<MenuItem[]> => {
  const response = await api.get(`/api/menu/items?categoryId=${categoryId}`);
  return response.data;
};

export const createMenuItem = async (data: MenuItemFormData): Promise<MenuItem> => {
  const response = await api.post('/api/menu/items', data);
  return response.data;
};

export const updateMenuItem = async (
  id: number,
  data: MenuItemFormData
): Promise<MenuItem> => {
  const response = await api.put(`/api/menu/items/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await api.delete(`/api/menu/items/${id}`);
};

export const updateMenuItemImage = async (
  id: number,
  imageData: FormData
): Promise<MenuItem> => {
  const response = await api.put(`/api/menu/items/${id}/image`, imageData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 