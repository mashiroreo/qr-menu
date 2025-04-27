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
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      {store.logoUrl && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src={store.logoUrl.startsWith('/uploads/') ? `http://192.168.1.50:3000${store.logoUrl}` : store.logoUrl} alt="店舗ロゴ" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
        </div>
      )}
      <h2>{store.name}</h2>
      {store.description && <p>{store.description}</p>}
      {store.address && <p><strong>住所:</strong> {store.address}</p>}
      {store.phone && <p><strong>電話番号:</strong> {store.phone}</p>}
      {store.businessHours && <p><strong>営業時間:</strong> {store.businessHours}</p>}
      <h3>メニュー</h3>
      {menu.length === 0 ? (
        <div>メニューが登録されていません</div>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {menu.map(item => (
            <li key={item.id} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
              {item.imageUrl && (
                <img src={item.imageUrl.startsWith('/uploads/') || item.imageUrl.startsWith('uploads/') ? `http://192.168.1.50:3000${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}` : item.imageUrl} alt={item.name} style={{ maxWidth: 100, maxHeight: 100, borderRadius: 8, marginRight: 12, float: 'left' }} />
              )}
              <div style={{ overflow: 'hidden' }}>
                <strong>{item.name}</strong> - {item.price}円<br />
                <span>{item.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MenuDisplay; 