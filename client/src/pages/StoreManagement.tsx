import { useState, useEffect } from 'react';
import { Store } from '../types/store';
import { StoreForm } from '../components/store/StoreForm';
import { StoreLogo } from '../components/store/StoreLogo';
import { getStoreInfo } from '../api/store';

export const StoreManagement = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoreInfo();
  }, []);

  const loadStoreInfo = async () => {
    try {
      const data = await getStoreInfo();
      setStore(data);
      setError(null);
    } catch (err) {
      setError('店舗情報の取得に失敗しました');
      console.error('Error loading store info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = (updatedStore: Store) => {
    setStore(updatedStore);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">店舗管理</h1>
      <div className="space-y-8">
        <StoreForm store={store} onUpdate={handleStoreUpdate} />
        <StoreLogo store={store} onUpdate={handleStoreUpdate} />
      </div>
    </div>
  );
}; 