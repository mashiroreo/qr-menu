import { useState } from 'react';
import { Store } from '../../types/store';
import { updateStoreLogo } from '../../api/store';

interface StoreLogoProps {
  store: Store | null;
  onUpdate: (store: Store) => void;
}

export const StoreLogo = ({ store, onUpdate }: StoreLogoProps) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      const updatedStore = await updateStoreLogo(formData);
      onUpdate(updatedStore);
      setSuccessMessage('ロゴを更新しました');
    } catch (err) {
      setError('ロゴの更新に失敗しました');
      console.error('Error updating store logo:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-xl font-bold mb-4">店舗ロゴ</h3>

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

      <div className="flex items-center space-x-4">
        <div className="w-32 h-32 border rounded-lg overflow-hidden">
          {store?.logoUrl ? (
            <img
              src={store.logoUrl.startsWith('/uploads/') ? `http://192.168.1.50:3000${store.logoUrl}` : store.logoUrl}
              alt="店舗ロゴ"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No Logo</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block">
            <span className="sr-only">ロゴを選択</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </label>
          <p className="mt-1 text-sm text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
}; 