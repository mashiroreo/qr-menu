import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Store } from '../types/store';
import { MenuItem, MenuCategory } from '../types/menu';
import axios from '../api/axios';
import { getCategoriesPublic, getMenuItemsPublic } from '../api/menuPublic';
import ImageModal from '../components/ImageModal';
import DescriptionModal from '../components/DescriptionModal';
import './MenuDisplay.css';

const MenuDisplay: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [menu, setMenu] = useState<{ [categoryId: number]: MenuItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<{ text: string; title: string } | null>(null);
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
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
      {selectedDescription && (
        <DescriptionModal
          description={selectedDescription.text}
          title={selectedDescription.title}
          onClose={() => setSelectedDescription(null)}
        />
      )}
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
          {/* 特別営業日表示 */}
          {Array.isArray(store.specialBusinessDays) && store.specialBusinessDays.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', color: '#e53935', marginBottom: 4 }}>
                {store.specialBusinessDays.some(day => day.date === new Date().toISOString().slice(0, 10))
                  ? '【本日は特別営業日です】'
                  : '【特別営業日】'}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#e53935' }}>
                {store.specialBusinessDays.map((day, idx) => (
                  <li key={day.date + '-' + idx}>
                    {day.date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2/$3')}：
                    {Array.isArray(day.periods) && day.periods.length > 0 ? (
                      day.periods.map((period, pIdx) => {
                        const [openHour, openMinute] = period.openTime.split(':').map(Number);
                        const [closeHour, closeMinute] = period.closeTime.split(':').map(Number);
                        const openMinutes = openHour * 60 + openMinute;
                        const closeMinutes = closeHour * 60 + closeMinute;
                        const isOvernight = openMinutes > closeMinutes;
                        const closeHourStr = isOvernight ? String(Number(period.closeTime.split(':')[0])) : period.closeTime.split(':')[0].padStart(2, '0');
                        const closeMinuteStr = period.closeTime.split(':')[1];
                        return (
                          <span key={pIdx}>
                            {period.isOpen ? `${period.openTime}〜${isOvernight ? '翌' : ''}${closeHourStr}:${closeMinuteStr}` : '休業'}
                            {pIdx < day.periods.length - 1 && <span> ／ </span>}
                          </span>
                        );
                      })
                    ) : '休業'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div><strong>営業時間{store.isHolidayClosed ? '（祝日は休業）' : '（祝日も営業）'}:</strong> {Array.isArray(store.businessHours) && store.businessHours.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {store.businessHours.map((hours, idx) => (
                <li key={hours.dayOfWeek + '-' + idx}>
                  {(() => {
                    switch (hours.dayOfWeek) {
                      case 'monday': return '月曜日';
                      case 'tuesday': return '火曜日';
                      case 'wednesday': return '水曜日';
                      case 'thursday': return '木曜日';
                      case 'friday': return '金曜日';
                      case 'saturday': return '土曜日';
                      case 'sunday': return '日曜日';
                      default: return hours.dayOfWeek;
                    }
                  })()}
                  ：
                  {Array.isArray(hours.periods) && hours.periods.length > 0 ? (
                    hours.periods.map((period, pIdx) => {
                      const [openHour, openMinute] = period.openTime.split(':').map(Number);
                      const [closeHour, closeMinute] = period.closeTime.split(':').map(Number);
                      const openMinutes = openHour * 60 + openMinute;
                      const closeMinutes = closeHour * 60 + closeMinute;
                      const isOvernight = openMinutes > closeMinutes;
                      // 0埋めなしの時刻文字列を生成
                      const closeHourStr = isOvernight ? String(Number(period.closeTime.split(':')[0])) : period.closeTime.split(':')[0].padStart(2, '0');
                      const closeMinuteStr = period.closeTime.split(':')[1];
                      return (
                        <span key={pIdx}>
                          {period.isOpen ? `${period.openTime}〜${isOvernight ? '翌' : ''}${closeHourStr}:${closeMinuteStr}` : '休業'}
                          {pIdx < hours.periods.length - 1 && <span> ／ </span>}
                        </span>
                      );
                    })
                  ) : '休業'}
                </li>
              ))}
            </ul>
          ) : '-'}</div>
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
                      <div 
                        className="menu-item-img-wrapper"
                        onClick={item.imageUrl ? () => setSelectedImage({ url: item.imageUrl!, alt: item.name }) : undefined}
                        role={item.imageUrl ? "button" : undefined}
                        tabIndex={item.imageUrl ? 0 : undefined}
                        onKeyPress={item.imageUrl ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedImage({ url: item.imageUrl!, alt: item.name });
                          }
                        } : undefined}
                      >
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl}
                            alt={item.name} 
                            className="menu-item-img" 
                          />
                        ) : (
                          <div className="menu-item-img menu-item-img-placeholder">
                            No Image
                          </div>
                        )}
                        {item.imageUrl && (
                          <div className="menu-item-img-overlay">
                            <span className="menu-item-img-zoom">拡大</span>
                          </div>
                        )}
                      </div>
                      <div className="menu-item-content">
                        <div className="menu-item-name">{item.name}</div>
                        <div className="menu-item-price">{item.price}円</div>
                        {item.description && (
                          <div 
                            className="menu-item-desc"
                            onClick={() => setSelectedDescription({ text: item.description!, title: item.name })}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedDescription({ text: item.description!, title: item.name });
                              }
                            }}
                          >
                            {item.description}
                          </div>
                        )}
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