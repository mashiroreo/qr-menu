import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types/menu';
import { getMenuItems, deleteMenuItem } from '../api/menu';

interface MenuItemListProps {
  storeId: number;
  categoryId: number;
  onEdit: (item: MenuItem) => void;
  refreshTrigger?: number;
}

const MenuItemList: React.FC<MenuItemListProps> = ({
  storeId,
  categoryId,
  onEdit,
  refreshTrigger = 0,
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getMenuItems(categoryId);
      setItems(data);
      setError(null);
    } catch (err) {
      setError('メニューアイテムの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryId, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('このメニューアイテムを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteMenuItem(id);
      await fetchItems(); // 削除後にリストを更新
    } catch (err) {
      setError('メニューアイテムの削除に失敗しました');
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

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        メニューアイテムがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {item.imageUrl && (
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={`http://localhost:3000/${item.imageUrl}`}
                alt={item.name}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
          {item.description && (
            <p className="text-gray-600 mb-2">{item.description}</p>
          )}
          <p className="text-lg font-bold mb-4">¥{item.price.toLocaleString()}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit(item)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuItemList; 