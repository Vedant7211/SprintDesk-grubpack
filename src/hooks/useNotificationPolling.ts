import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../stores/notification.store';
import type { Notification } from '../stores/notification.store';
interface UseNotificationPollingOptions {
  isPanelOpenRef: React.RefObject<boolean>;
  onNewNotifications: (items: Notification[]) => void;
  intervalMs?: number;
}
const JSONPLACEHOLDER_LIMIT = 5;
export function useNotificationPolling({
  isPanelOpenRef,
  onNewNotifications,
  intervalMs = 30_000,
}: UseNotificationPollingOptions) {
  const addNotifications = useNotificationStore((s) => s.addNotifications);
  const pollCountRef   = useRef(0);
  const isPausedRef    = useRef(false);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const onNewRef       = useRef(onNewNotifications);
  useEffect(() => { onNewRef.current = onNewNotifications; }, [onNewNotifications]);
  useEffect(() => {
    const fetchAndProcess = async () => {
      if (isPausedRef.current) return;
      const page = (pollCountRef.current % 20) + 1;
      pollCountRef.current++;
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts?_limit=${JSONPLACEHOLDER_LIMIT}&_page=${page}`
        );
        if (!res.ok) return;
        const posts: Array<{ id: number; title: string; body: string }> = await res.json();
        const freshItems = addNotifications(
          posts.map((p) => ({ id: p.id, title: p.title, body: p.body }))
        );
        if (freshItems.length > 0 && !isPanelOpenRef.current) {
          onNewRef.current(freshItems);
        }
      } catch {
      }
    };
    fetchAndProcess();
    timerRef.current = setInterval(fetchAndProcess, intervalMs);
    const handleVisibility = () => {
      if (document.hidden) {
        isPausedRef.current = true;
      } else {
        isPausedRef.current = false;
        fetchAndProcess(); 
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]); 
}
