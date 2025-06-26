import { render, screen, waitFor } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Node.js 環境で TextEncoder/Decoder が未定義の場合 polyfill
if (typeof global.TextEncoder === 'undefined') {
  // @ts-expect-error: jsdom global に型が無いため代入
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-expect-error: jsdom global に型が無いため代入
  global.TextDecoder = TextDecoder;
}

// ------------------ Firebase モック ------------------
let mockUser: { uid?: string } | null = null;

type OnAuthStateChangedCallback = (user: { uid?: string } | null) => void;

jest.mock('../../libs/firebase', () => {
  return {
    auth: {
      onAuthStateChanged: (callback: OnAuthStateChangedCallback) => {
        callback(mockUser);
        return () => {};
      },
      signOut: jest.fn(),
    },
  };
});

import { auth as firebaseAuth } from '../../libs/firebase';

// ------------------ テスト用コンポーネント ------------------
const LoginPage = () => <div>Login Page</div>;
const StorePage = () => <div>Store Page</div>;

const TestPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = firebaseAuth.onAuthStateChanged((user) => setAuthed(!!user));
    return unsub;
  }, []);

  if (authed === null) return <div>Loading...</div>;
  return authed ? <>{children}</> : <Navigate to="/login" />;
};

const TestAuthRedirect: React.FC = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = firebaseAuth.onAuthStateChanged((user) => setAuthed(!!user));
    return unsub;
  }, []);

  if (authed === null) return <div>Loading...</div>;
  return authed ? <Navigate to="/store" replace /> : <Navigate to="/login" replace />;
};

// ------------------ Tests ------------------

describe('Login / Navigation ガード', () => {
  afterEach(() => {
    mockUser = null;
  });

  it('未ログイン時は /login へリダイレクトされる', async () => {
    mockUser = null;

    render(
      <MemoryRouter initialEntries={["/store"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/store" element={<TestPrivateRoute><StorePage /></TestPrivateRoute>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('ログイン済みなら保護ルートにアクセスできる', async () => {
    mockUser = { uid: 'test-user' };

    render(
      <MemoryRouter initialEntries={["/store"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/store" element={<TestPrivateRoute><StorePage /></TestPrivateRoute>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Store Page')).toBeInTheDocument();
    });
  });

  it('AuthRedirect は状態に応じて遷移する', async () => {
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

    // ログイン状態に変更して再検証
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