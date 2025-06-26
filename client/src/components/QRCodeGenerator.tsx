import React, { useState, useEffect } from 'react';
import { generateQRCode } from '../api/qr';
import { getStoreInfo } from '../api/store';

// 環境変数は Vite の define で `process.env.VITE_*` に展開させる
const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3000';
// フロントエンド公開 URL（QR プレビュー用）
const APP_URL = process.env.VITE_APP_URL ?? window.location.origin;

const QRCodeGenerator: React.FC = () => {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // マウント時に自動で店舗IDを取得
    const fetchStoreId = async () => {
      try {
        const store = await getStoreInfo();
        setStoreId(store.id);
      } catch {
        setError('店舗情報の取得に失敗しました');
      }
    };
    fetchStoreId();
  }, []);

  const handleGenerate = async () => {
    if (!storeId) return;
    setLoading(true);
    setError('');
    setQrUrl(null);
    try {
      const url = await generateQRCode(storeId);
      setQrUrl(url);
    } catch {
      setError('QRコードの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>QRコード生成</h2>
      {storeId ? (
        <>
          <button
            onClick={handleGenerate}
            style={{
              padding: '0.75rem 2rem',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 24,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
            }}
            disabled={loading}
          >
            {loading ? '生成中...' : 'QRコードを生成する'}
          </button>
        </>
      ) : (
        <div style={{ color: 'red', marginTop: 8 }}>店舗IDが取得できません</div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {qrUrl && (
        <div style={{ marginTop: 24 }}>
          <img src={`${API_URL}${qrUrl}`} alt="QRコード" style={{ width: 200, height: 200 }} />
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <button
              style={{
                width: 180,
                padding: '0.75rem 0',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: 8,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#1565c0')}
              onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
              onClick={() => window.open(`${API_URL}${qrUrl}`, '_blank', 'noopener,noreferrer')}
            >
              大きく表示
            </button>
            <button
              style={{
                width: 180,
                padding: '0.75rem 0',
                background: '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(67, 160, 71, 0.10)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#388e3c')}
              onMouseOut={e => (e.currentTarget.style.background = '#43a047')}
              onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}${qrUrl}`);
                  if (!response.ok) throw new Error('QRコードの取得に失敗しました');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = qrUrl.split('/').pop() || 'qr-code.png';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('ダウンロードエラー:', err);
                  setError('QRコードのダウンロードに失敗しました');
                }
              }}
            >
              ダウンロード
            </button>
            <button
              style={{
                width: 180,
                padding: '0.75rem 0',
                background: '#ffa000',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 160, 0, 0.10)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#ff8f00')}
              onMouseOut={e => (e.currentTarget.style.background = '#ffa000')}
              onClick={() => window.open(`${APP_URL}/menu/${storeId}`, '_blank', 'noopener,noreferrer')}
            >
              プレビュー
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator; 