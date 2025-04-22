import { useState, useEffect } from 'react';
import { Store, StoreFormData } from '../../types/store';
import { getStoreInfo, updateStoreInfo } from '../../api/store';

export const StoreForm = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const data: StoreFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      businessHours: formData.get('businessHours') as string,
    };

    try {
      const updatedStore = await updateStoreInfo(data);
      setStore(updatedStore);
      setSuccessMessage('店舗情報を更新しました');
    } catch (err) {
      setError('店舗情報の更新に失敗しました');
      console.error('Error updating store info:', err);
    }
  };

  if (loading) {
    return <div className="text-center">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">店舗情報</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            店舗名 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={store?.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            店舗説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={store?.description}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            住所
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={store?.address}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={store?.phone}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700">
            営業時間
          </label>
          <input
            type="text"
            id="businessHours"
            name="businessHours"
            defaultValue={store?.businessHours}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
}; 