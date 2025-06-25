import { render, screen, waitFor } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
// Node.js 環境で TextEncoder/Decoder がない場合のポリフィル
// @ts-ignore
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
// @ts-ignore
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// firebase ライブラリをモック
let mockUser: any = null;

jest.mock('../../libs/firebase', () => {
  return {
    auth: {
      onAuthStateChanged: (callback: any) => {
        // 呼び出し時に現在の mockUser を渡す
        callback(mockUser);
        // unsubscribe ダミー
        return () => {};
      },
      signOut: jest.fn(),
    },
  };
});

const LoginPage = () => <div>Login Page</div>;
const StorePage = () => <div>Store Page</div>;

// テスト専用の簡易 Guard コンポーネント（App.tsx の PrivateRoute / AuthRedirect 簡易版）
const TestPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = (require('../../libs/firebase').auth as any).onAuthStateChanged((user: any) => {
      setAuthed(!!user);
    });
    return unsub;
  }, []);

  if (authed === null) return <div>Loading...</div>;
  return authed ? <>{children}</> : <Navigate to="/login" />;
};

const TestAuthRedirect: React.FC = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = (require('../../libs/firebase').auth as any).onAuthStateChanged((user: any) => {
      setAuthed(!!user);
    });
    return unsub;
  }, []);

  if (authed === null) return <div>Loading...</div>;
  return authed ? <Navigate to="/store" replace /> : <Navigate to="/login" replace />;
};

describe('Login / Navigation ガード', () => {
  afterEach(() => {
    mockUser = null;
  });

  it('未ログイン時は /login へリダイレクトされる', async () => {
    mockUser = null; // 認証なし

    render(
      <MemoryRouter initialEntries={["/store"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/store"
            element={
              <TestPrivateRoute>
                <StorePage />
              </TestPrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Login Page が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('ログイン済みなら保護ルートにアクセスできる', async () => {
    mockUser = { uid: 'test-user' }; // 認証済みユーザー

    render(
      <MemoryRouter initialEntries={["/store"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/store"
            element={
              <TestPrivateRoute>
                <StorePage />
              </TestPrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Store Page')).toBeInTheDocument();
    });
  });

  it('AuthRedirect は未ログインで /login、ログイン済みで /store へ遷移する', async () => {
    // 未ログインケース
    mockUser = null;
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TestAuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/store" element={<StorePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    // ログイン済みに切り替えて再検証
    mockUser = { uid: 'logged-in' };
    unmount();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TestAuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/store" element={<StorePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Store Page')).toBeInTheDocument();
    });
  });
}); 