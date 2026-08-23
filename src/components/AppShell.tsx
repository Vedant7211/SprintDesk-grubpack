import React, { useCallback, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut, Activity, X } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { NotificationBell } from "./NotificationBell";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import type { Notification } from "../stores/notification.store";
const NAV_ITEMS = [
  { to: "/dashboard",  label: "Dashboard" },
  { to: "/board",      label: "Sprint Board" },
  { to: "/analytics",  label: "Analytics" },
];
interface ToastItem { id: number; count: number }
const Toast: React.FC<{ item: ToastItem; onDismiss: (id: number) => void }> = ({ item, onDismiss }) => {
  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), 4000);
    return () => clearTimeout(t);
  }, [item.id, onDismiss]);
  return (
    <div
      id={`toast-${item.id}`}
      className="flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl"
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      <Bell size={18} />
      <span>
        <strong>{item.count}</strong> new notification{item.count > 1 ? "s" : ""}
      </span>
      <button
        onClick={() => onDismiss(item.id)}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};
export const AppShell: React.FC = () => {
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [toasts, setToasts]           = useState<ToastItem[]>([]);
  const isPanelOpenRef                = useRef(false);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const handleNewNotifications = useCallback((items: Notification[]) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now(), count: items.length },
    ]);
  }, []);
  useNotificationPolling({
    isPanelOpenRef,
    onNewNotifications: handleNewNotifications,
  });
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity size={16} color="white" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">SprintDesk</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell
              onOpenChange={(open) => { isPanelOpenRef.current = open; }}
            />
            {user && (
              <div className="flex items-center gap-2 ml-1">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.firstName}
                    className="w-7 h-7 rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {user.firstName?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            )}
            <button
              id="header-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
