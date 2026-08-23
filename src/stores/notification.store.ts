import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface Notification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  receivedAt: string; 
}
interface NotificationState {
  notifications: Notification[];
  seenIds: number[];
  addNotifications: (items: Pick<Notification, 'id' | 'title' | 'body'>[]) => Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}
const MAX_STORED = 100; 
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      seenIds: [],
      addNotifications: (items) => {
        const { seenIds, notifications } = get();
        const fresh = items.filter((item) => !seenIds.includes(item.id));
        if (fresh.length === 0) return [];
        const now = new Date().toISOString();
        const newNotifs: Notification[] = fresh.map((item) => ({
          ...item,
          isRead: false,
          receivedAt: now,
        }));
        set({
          notifications: [...newNotifs, ...notifications].slice(0, MAX_STORED),
          seenIds: [...seenIds, ...fresh.map((n) => n.id)],
        });
        return newNotifs;
      },
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      clearAll: () => set({ notifications: [], seenIds: [] }),
    }),
    {
      name: 'sprintdesk-notifications',
      version: 1,
    }
  )
);
