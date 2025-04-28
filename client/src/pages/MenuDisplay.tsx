import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Store } from '../types/store';
import { MenuItem, MenuCategory } from '../types/menu';
import axios from '../api/axios';
import { getCategoriesPublic, getMenuItemsPublic } from '../api/menuPublic';

const MenuDisplay: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 店舗情報取得
        const storeRes = await axios.get(`/api/stores/public/${storeId}`);
        setStore(storeRes.data);
        // カテゴリ取得
        const cats = await getCategoriesPublic(storeId);
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
        }
      } catch (err) {
        setError('店舗またはカテゴリ情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    if (storeId) fetchData();
  }, [storeId]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      setError('');
      try {
        const items = await getMenuItemsPublic(selectedCategory.id);
        setMenu(items);
      } catch (err) {
        setError('メニュー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [selectedCategory]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!store) return <div>店舗情報が見つかりません</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#222' }}>
      {/* サイドバー */}
      <nav style={{ width: 220, minWidth: 160, background: '#181818', borderRight: '1px solid #333', padding: '32px 0', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 32, letterSpacing: 2 }}>{store.name}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                style={{
                  width: '100%',
                  background: selectedCategory?.id === cat.id ? '#333' : 'none',
                  color: selectedCategory?.id === cat.id ? '#ffe082' : '#fff',
                  border: 'none',
                  textAlign: 'left',
                  padding: '14px 24px',
                  fontWeight: selectedCategory?.id === cat.id ? 700 : 500,
                  fontSize: 17,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* メインコンテンツ */}
      <main style={{ flex: 1, padding: '40px 24px 40px 48px', maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
        {/* 店舗情報 */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ width: '100%', padding: '24px 16px 16px 16px', borderBottom: '2px solid #444', background: '#232323', borderRadius: 12, marginBottom: 24 }}>
            {store.logoUrl && (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <img src={store.logoUrl.startsWith('/uploads/') || store.logoUrl.startsWith('uploads/') ? `http://192.168.1.50:3000${store.logoUrl.startsWith('/') ? store.logoUrl : '/' + store.logoUrl}` : store.logoUrl} alt="店舗ロゴ" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', width: '100%', height: 'auto', background: '#fff' }} />
              </div>
            )}
            <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700, color: '#ffe082' }}><span style={{ color: '#ffe082' }}>店舗名:</span> {store.name}</h2>
            {store.description && <p style={{ marginBottom: 12, fontSize: 16, color: '#fff' }}><strong>店舗説明:</strong> {store.description}</p>}
            <div style={{ fontSize: 15, color: '#eee', marginBottom: 4 }}><strong>住所:</strong> {store.address || '-'}</div>
            <div style={{ fontSize: 15, color: '#eee', marginBottom: 4 }}><strong>電話番号:</strong> {store.phone || '-'}</div>
            <div style={{ fontSize: 15, color: '#eee', marginBottom: 4 }}><strong>営業時間:</strong> {store.businessHours || '-'}</div>
          </div>
        </section>
        {/* メニューセクション */}
        <section>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, color: '#ffe082', letterSpacing: 1 }}>メニュー</h3>
          {menu.length === 0 ? (
            <div style={{ color: '#bbb', fontSize: 16 }}>このカテゴリにはメニューがありません</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
              {menu.map(item => (
                <div key={item.id} style={{ background: '#292929', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.18)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'box-shadow 0.2s', minHeight: 320 }}>
                  {item.imageUrl && (
                    <img src={item.imageUrl.startsWith('/uploads/') || item.imageUrl.startsWith('uploads/') ? `http://192.168.1.50:3000${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}` : item.imageUrl} alt={item.name} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 10, background: '#fff', marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.10)' }} />
                  )}
                  <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 6, color: '#fff', textAlign: 'center', wordBreak: 'break-word' }}>{item.name}</div>
                  <div style={{ color: '#ffe082', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{item.price}円</div>
                  <div style={{ color: '#ccc', fontSize: 15, textAlign: 'center', wordBreak: 'break-word' }}>{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MenuDisplay; 