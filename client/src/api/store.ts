import axios from 'axios';
import { Store, StoreFormData, StoreLogoData } from '../types/store';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/stores`,
  withCredentials: true,
});

// リクエストインターセプターでトークンを設定
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getStoreInfo = async (): Promise<Store> => {
  const response = await api.get('/owner');
  return response.data;
};

export const updateStoreInfo = async (data: StoreFormData): Promise<Store> => {
  const response = await api.put('/owner', data);
  return response.data;
};

export const updateStoreLogo = async (data: StoreLogoData): Promise<Store> => {
  const response = await api.put('/owner/logo', data);
  return response.data;
}; 