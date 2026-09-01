"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNotifications, markNotificationRead, Notification } from "@/lib/api";

const POLL_INTERVAL_MS = 30 * 1000;

export function useNotifications(accessToken: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!accessToken) return;
    fetchNotifications(accessToken)
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessToken, load]);

  async function markRead(id: number) {
    if (!accessToken) return;
    const updated = await markNotificationRead(accessToken, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, markRead };
}