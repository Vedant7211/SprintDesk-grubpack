import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../stores/notification.store';
const PAGE_SIZE = 20;
const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
export const NotificationBell: React.FC<{
  onOpenChange?: (open: boolean) => void;
}> = ({ onOpenChange }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen]   = useState(false);
  const [page, setPage]       = useState(1);
  const panelRef              = useRef<HTMLDivElement>(null);
  const buttonRef             = useRef<HTMLButtonElement>(null);
  const unreadCount  = notifications.filter((n) => !n.isRead).length;
  const totalPages   = Math.ceil(notifications.length / PAGE_SIZE);
  const pageItems    = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { onOpenChange?.(isOpen); }, [isOpen, onOpenChange]);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);
  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev) setPage(1);
      return !prev;
    });
  };
  const handleMarkRead = (id: number) => {
    markAsRead(id);
  };
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id="notification-bell-btn"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-11 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                id="notifications-mark-all-read"
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell size={18} />
                <p className="text-sm mt-3">No notifications yet</p>
              </div>
            ) : (
              <ul role="list">
                {pageItems.map((notif) => (
                  <li
                    key={notif.id}
                    id={`notification-item-${notif.id}`}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notif.isRead ? '' : 'bg-blue-50/40'
                    }`}
                    onClick={() => handleMarkRead(notif.id)}
                  >
                    <div className="mt-1.5 shrink-0">
                      {notif.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug truncate ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{formatTime(notif.receivedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <button
                id="notifications-prev-page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-100"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                id="notifications-next-page"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-100"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
