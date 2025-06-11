import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth } from 'firebase/auth';

// 環境変数からbaseURLを取得
const baseURL = import.meta.env.VITE_API_URL || 'http://192.168.1.59:3000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// リクエストインターセプターでトークンを設定
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    try {
      const token = await user.getIdToken(true);
      if (config.headers) {  // headersの存在チェックを追加
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('トークンの更新に失敗しました:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// レスポンスインターセプターでエラーハンドリング
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const token = await user.getIdToken(true);
          if (originalRequest.headers) {  // headersの存在チェックを追加
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('トークンの更新に失敗しました:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 