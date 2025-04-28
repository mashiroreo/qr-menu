import api from './axios';
import { MenuCategory, MenuItem } from '../types/menu';

export const getCategoriesPublic = async (storeId: number | string): Promise<MenuCategory[]> => {
  const response = await api.get(`/api/menu/public/categories?storeId=${storeId}`);
  return response.data;
};

export const getMenuItemsPublic = async (categoryId: number | string): Promise<MenuItem[]> => {
  const response = await api.get(`/api/menu/public/items?categoryId=${categoryId}`);
  return response.data;
}; 