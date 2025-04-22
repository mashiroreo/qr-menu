import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/auth/Login";
import { UserProfile } from "./components/auth/UserProfile";
import { auth } from "./libs/firebase";
import { useEffect, useState } from "react";
import { StoreManagement } from './pages/StoreManagement';
import MenuManagement from './pages/MenuManagement';
import Navigation from './components/layout/Navigation';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigation>{children}</Navigation> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/store"
          element={
            <PrivateRoute>
              <StoreManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <MenuManagement />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/store" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
