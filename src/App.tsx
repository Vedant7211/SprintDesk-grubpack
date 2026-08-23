import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { Board } from "./pages/Board";
import { Analytics } from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { useAuthStore } from "./stores/auth.store";
import { useEffect } from "react";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) return <div>Initializing...</div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — wrapped in AppShell sidebar */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/board"      element={<Board />} />
          <Route path="/analytics"  element={<Analytics />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}

export default App;
