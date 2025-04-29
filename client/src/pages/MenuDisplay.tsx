import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Store } from '../types/store';
import { MenuItem, MenuCategory } from '../types/menu';
import axios from '../api/axios';
import { getCategoriesPublic, getMenuItemsPublic } from '../api/menuPublic';
import './MenuDisplay.css';

const MenuDisplay: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [menu, setMenu] = useState<{ [categoryId: number]: MenuItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // カテゴリごとのrefを管理
  const categoryRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  // 店舗情報セクションのref
  const storeInfoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 店舗情報取得
        const storeRes = await axios.get(`/api/stores/public/${storeId}`);
        setStore(storeRes.data as Store);
        // カテゴリ取得
        const cats = await getCategoriesPublic(storeId!);
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
        }
        // 全カテゴリ分のメニューを取得
        const menuObj: { [categoryId: number]: MenuItem[] } = {};
        await Promise.all(
          cats.map(async (cat) => {
            const items = await getMenuItemsPublic(cat.id);
            menuObj[cat.id] = items;
          })
        );
        setMenu(menuObj);
      } catch (err) {
        setError('店舗またはカテゴリ情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    if (storeId) fetchData();
  }, [storeId]);

  // サイドバーのカテゴリボタン押下時のハンドラ
  const handleCategoryClick = (cat: MenuCategory) => {
    setSelectedCategory(cat);
    // スクロール
    setTimeout(() => {
      const ref = categoryRefs.current[cat.id];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // 店舗名クリック時のハンドラ
  const handleStoreNameClick = () => {
    if (storeInfoRef.current) {
      storeInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!store) return <div>店舗情報が見つかりません</div>;

  return (
    <div className="menu-root-responsive">
      {/* サイドバー（PC） or タブ（モバイル） */}
      <nav className="menu-sidebar-responsive">
        <div 
          className="menu-store-title"
          onClick={handleStoreNameClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleStoreNameClick();
            }
          }}
        >
          {store.name}
        </div>
        <ul className="menu-category-list">
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                className={'menu-category-btn' + (selectedCategory?.id === cat.id ? ' selected' : '')}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* メインコンテンツ */}
      <main className="menu-main-responsive">
        {/* 店舗情報 */}
        <section className="menu-store-info" ref={storeInfoRef}>
          {store.logoUrl && (
            <div className="menu-store-logo">
              <img src={store.logoUrl} alt="店舗ロゴ" />
            </div>
          )}
          <h2><span>店舗名:</span> {store.name}</h2>
          {store.description && <p><strong>店舗説明:</strong> {store.description}</p>}
          <div><strong>住所:</strong> {store.address || '-'}</div>
          <div><strong>電話番号:</strong> {store.phone || '-'}</div>
          <div><strong>営業時間:</strong> {store.businessHours || '-'}</div>
        </section>
        {/* メニューセクション */}
        <section>
          <h3 className="menu-section-title">メニュー</h3>
          {categories.map(cat => (
            <div
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el; }}
              style={{ marginBottom: 40 }}
            >
              <h4 className="menu-section-title" style={{ fontSize: 18, marginBottom: 16 }}>{cat.name}</h4>
              {(!menu[cat.id] || menu[cat.id].length === 0) ? (
                <div className="menu-empty">このカテゴリにはメニューがありません</div>
              ) : (
                <div className="menu-grid-responsive">
                  {menu[cat.id].map(item => (
                    <div key={item.id} className="menu-item-card">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl}
                          alt={item.name} 
                          className="menu-item-img" 
                        />
                      )}
                      <div className="menu-item-content">
                        <div className="menu-item-name">{item.name}</div>
                        <div className="menu-item-price">{item.price}円</div>
                        {item.description && <div className="menu-item-desc">{item.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MenuDisplay; 