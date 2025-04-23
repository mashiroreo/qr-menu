import React, { useEffect, useState } from 'react';
import { MenuCategory } from '../types/menu';
import { getCategories, deleteCategory } from '../api/menu';

interface MenuCategoryListProps {
  onEdit: (category: MenuCategory) => void;
  refreshTrigger?: number;
}

const MenuCategoryList: React.FC<MenuCategoryListProps> = ({ onEdit, refreshTrigger }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('カテゴリーの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm('このカテゴリーを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      setError('カテゴリーの削除に失敗しました');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => onEdit(category)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          カテゴリーがありません。新規追加ボタンからカテゴリーを作成してください。
        </div>
      )}
    </div>
  );
};

export default MenuCategoryList; 