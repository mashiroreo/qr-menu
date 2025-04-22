import axios from 'axios';
import {
  MenuCategory,
  MenuItem,
  MenuCategoryFormData,
  MenuItemFormData,
  MenuItemImageData,
} from '../types/menu';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/menu`,
  withCredentials: true,
});

// リクエストインターセプターでトークンを設定
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// カテゴリー関連のAPI
export const getCategories = async (): Promise<MenuCategory[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (data: MenuCategoryFormData): Promise<MenuCategory> => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: MenuCategoryFormData): Promise<MenuCategory> => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

// メニューアイテム関連のAPI
export const getMenuItems = async (categoryId?: string): Promise<MenuItem[]> => {
  const url = categoryId ? `/items?categoryId=${categoryId}` : '/items';
  const response = await api.get(url);
  return response.data;
};

export const createMenuItem = async (data: MenuItemFormData): Promise<MenuItem> => {
  const response = await api.post('/items', data);
  return response.data;
};

export const updateMenuItem = async (id: string, data: MenuItemFormData): Promise<MenuItem> => {
  const response = await api.put(`/items/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const updateMenuItemImage = async (id: string, data: MenuItemImageData): Promise<MenuItem> => {
  const response = await api.put(`/items/${id}/image`, data);
  return response.data;
}; 