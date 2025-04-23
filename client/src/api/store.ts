import api from './axios';
import { Store, StoreFormData } from '../types/store';

export const getStoreInfo = async (): Promise<Store> => {
  const response = await api.get('/api/stores/owner');
  return response.data;
};

export const updateStore = async (data: StoreFormData): Promise<Store> => {
  const response = await api.put('/api/stores/owner', data);
  return response.data;
};

export const updateStoreLogo = async (data: FormData): Promise<Store> => {
  const response = await api.put('/api/stores/owner/logo', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 