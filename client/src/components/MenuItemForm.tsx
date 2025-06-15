import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types/menu';
import {
  createMenuItem,
  updateMenuItem,
  updateMenuItemImage,
  deleteMenuItemImage,
} from '../api/menu';

interface MenuItemFormProps {
  storeId: number;
  categoryId: number;
  item?: MenuItem;
  onSubmit: () => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  storeId,
  categoryId,
  item,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);

  useEffect(() => {
    // 既存の画像URLがある場合、プレビューを設定
    if (item?.imageUrl) {
      setImagePreview(item.imageUrl);
      setImageDeleted(false);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // プレビュー用のURL生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // バリデーション
      if (!formData.name.trim()) {
        setError('商品名を入力してください');
        setLoading(false);
        return;
      }

      if (Number(formData.price) < 0) {
        setError('価格は0以上を入力してください');
        setLoading(false);
        return;
      }

      // 送信データの準備
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: Number(formData.price),
        categoryId: Number(categoryId),
        storeId: Number(storeId),
      };

      if (item) {
        // 更新の場合
        await updateMenuItem(item.id, submitData);
        if (imageDeleted) {
          if (item.imageUrl) {
            await deleteMenuItemImage(item.id);
          }
        } else if (selectedImage) {
          const imageData = new FormData();
          imageData.append('image', selectedImage);
          await updateMenuItemImage(item.id, imageData);
        }
      } else {
        // 新規作成の場合
        const newItem = await createMenuItem(submitData);
        if (selectedImage) {
          const imageData = new FormData();
          imageData.append('image', selectedImage);
          await updateMenuItemImage(newItem.id, imageData);
        }
      }
      onSubmit();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 400) {
        setError('入力内容を確認してください');
      } else {
        setError('メニューアイテムの保存に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          商品名
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          価格
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          画像
        </label>
        <div className="mt-2 flex items-center space-x-4">
          <div className="relative">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setImageDeleted(true);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              PNG, JPG, GIF形式の画像をアップロードできます
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm; 