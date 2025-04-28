import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Store } from '../types/store';
import { MenuItem } from '../types/menu';
import axios from '../api/axios';

const MenuDisplay: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
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
        // メニュー情報取得
        const menuRes = await axios.get(`/api/menu/public?storeId=${storeId}`);
        setMenu(menuRes.data);
      } catch (err) {
        setError('店舗またはメニュー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    if (storeId) fetchData();
  }, [storeId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!store) return <div>店舗情報が見つかりません</div>;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {/* 店舗情報セクション */}
      <section style={{ width: '100%', padding: '32px 16px 16px 16px', borderBottom: '2px solid #f0f0f0' }}>
        {store.logoUrl && (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img src={store.logoUrl.startsWith('/uploads/') || store.logoUrl.startsWith('uploads/') ? `http://192.168.1.50:3000${store.logoUrl.startsWith('/') ? store.logoUrl : '/' + store.logoUrl}` : store.logoUrl} alt="店舗ロゴ" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', height: 'auto' }} />
          </div>
        )}
        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700 }}><span style={{ color: '#1976d2' }}>店舗名:</span> {store.name}</h2>
        {store.description && <p style={{ marginBottom: 12, fontSize: 16 }}><strong>店舗説明:</strong> {store.description}</p>}
        <div style={{ fontSize: 15, color: '#333', marginBottom: 4 }}><strong>住所:</strong> {store.address || '-'}</div>
        <div style={{ fontSize: 15, color: '#333', marginBottom: 4 }}><strong>電話番号:</strong> {store.phone || '-'}</div>
        <div style={{ fontSize: 15, color: '#333', marginBottom: 4 }}><strong>営業時間:</strong> {store.businessHours || '-'}</div>
      </section>
      {/* メニューセクション */}
      <section style={{ width: '100%', padding: '32px 16px 0 16px' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, borderBottom: '2px solid #1976d2', paddingBottom: 6, color: '#1976d2' }}>メニュー</h3>
        {menu.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16 }}>メニューが登録されていません</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {menu.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', background: '#f7fafd', borderRadius: 12, boxShadow: '0 1px 4px rgba(25,118,210,0.04)', padding: 16, gap: 20, flexWrap: 'wrap' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl.startsWith('/uploads/') || item.imageUrl.startsWith('uploads/') ? `http://192.168.1.50:3000${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}` : item.imageUrl} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: '#eee', flexShrink: 0, maxWidth: '100%' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, wordBreak: 'break-word' }}>{item.name} <span style={{ fontWeight: 400, color: '#555', fontSize: 16 }}>- {item.price}円</span></div>
                  <div style={{ color: '#444', fontSize: 15, wordBreak: 'break-word' }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MenuDisplay; 