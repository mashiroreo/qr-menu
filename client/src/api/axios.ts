import axios from 'axios';
import { getAuth } from 'firebase/auth';

// スマホからもアクセスできるよう、PCのIPアドレスをbaseURLに設定
const baseURL = 'http://192.168.1.50:3000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// リクエストインターセプターでトークンを設定
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    try {
      // 強制的に新しいトークンを取得
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // トークンの期限切れエラーの場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          // 新しいトークンを取得
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // リクエストを再試行
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