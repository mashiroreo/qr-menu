import { useState } from 'react';
import { Store } from '../../types/store';
import { updateStoreLogo, deleteStoreLogo } from '../../api/store';

interface StoreLogoProps {
  store: Store | null;
  onUpdate: (store: Store) => void;
}

export const StoreLogo = ({ store, onUpdate }: StoreLogoProps) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoDeleted, setLogoDeleted] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setUploading(true);
    setLogoDeleted(false);

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

  const handleDeleteLogo = () => {
    setLogoDeleted(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    setUploading(true);
    try {
      if (logoDeleted && store?.logoUrl) {
        await deleteStoreLogo();
        onUpdate({ ...store, logoUrl: null });
        setSuccessMessage('ロゴを削除しました');
        setUploading(false);
        return;
      }
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
        <div className="w-32 h-32 border rounded-lg overflow-hidden relative">
          {store?.logoUrl && !logoDeleted && (
            <>
              <img
                src={store.logoUrl}
                alt="店舗ロゴ"
                className="w-32 h-32 object-cover rounded-full"
              />
              <button
                type="button"
                onClick={handleDeleteLogo}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                title="ロゴ画像を削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
          {(!store?.logoUrl || logoDeleted) && (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400">
              <span>ロゴ未登録</span>
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

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}; 