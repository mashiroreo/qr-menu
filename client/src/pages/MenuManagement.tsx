import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '../types/menu';
import MenuCategoryList from '../components/MenuCategoryList';
import MenuCategoryForm from '../components/MenuCategoryForm';
import MenuItemList from '../components/MenuItemList';
import MenuItemForm from '../components/MenuItemForm';
import { getStoreInfo } from '../api/store';

const MenuManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemRefreshTrigger, setItemRefreshTrigger] = useState(0);
  const [storeId, setStoreId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const store = await getStoreInfo();
        setStoreId(store.id);
      } catch (error) {
        console.error('店舗情報の取得に失敗しました:', error);
      }
    };
    fetchStoreId();
  }, []);

  const handleEditCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
    setShowCategoryForm(true);
  };

  const handleItemSelect = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleCategorySuccess = () => {
    setShowCategoryForm(false);
    setSelectedCategory(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleItemSuccess = () => {
    setShowItemForm(false);
    setSelectedItem(null);
    setItemRefreshTrigger(prev => prev + 1);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowCategoryForm(true);
  };

  if (!storeId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-3 md:px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">メニュー管理</h2>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            カテゴリー追加
          </button>
        </div>
        
        {showCategoryForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <MenuCategoryForm
              category={selectedCategory}
              onSuccess={handleCategorySuccess}
              onCancel={() => {
                setShowCategoryForm(false);
                setSelectedCategory(null);
              }}
            />
          </div>
        )}

        <MenuCategoryList
          onEdit={handleEditCategory}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {selectedCategory && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="text-xl font-bold truncate max-w-[70%]"
              title={selectedCategory.name}
            >
              {selectedCategory.name}
              <span className="hidden sm:inline">のメニュー</span>
            </h3>
            <button
              onClick={() => setShowItemForm(true)}
              className="flex-shrink-0 px-3 py-1 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <span className="sm:hidden">追加</span>
              <span className="hidden sm:inline">メニュー追加</span>
            </button>
          </div>

          {showItemForm && storeId && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <MenuItemForm
                storeId={storeId}
                categoryId={selectedCategory.id}
                item={selectedItem}
                onSubmit={handleItemSuccess}
                onCancel={() => {
                  setShowItemForm(false);
                  setSelectedItem(null);
                }}
              />
            </div>
          )}

          {storeId && (
            <MenuItemList
              storeId={storeId}
              categoryId={selectedCategory.id}
              onEdit={handleItemSelect}
              refreshTrigger={itemRefreshTrigger}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MenuManagement; 