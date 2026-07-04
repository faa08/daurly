"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/backend/authService";
import {
  notificationService,
  type NotificationItem,
} from "@/backend/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const user = authService.getCurrentUser();
      return user?.id_user ?? null;
    }
    return null;
  });

  const load = useCallback(async (uid: string | null) => {
    if (!uid) {
      setNotifications([]);
      return;
    }
    const items = await notificationService.getForUser(uid);
    setNotifications(items);
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const u = authService.getCurrentUser();
      setUserId(u?.id_user ?? null);
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    window.addEventListener("pelum-user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
      window.removeEventListener("pelum-user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(userId);
  }, [userId, load]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => load(userId), 8000);
    return () => clearInterval(interval);
  }, [userId, load]);

  useEffect(() => {
    const onRefresh = () => {
      if (userId) load(userId);
    };
    window.addEventListener("pelum-notif-refresh", onRefresh);
    return () => window.removeEventListener("pelum-notif-refresh", onRefresh);
  }, [userId, load]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await notificationService.markAllRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = async () => {
    if (!userId) return;
    await notificationService.deleteAll(userId);
    setNotifications([]);
  };

  const handleToggleRead = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const nextUnread = !item.unread;
    await notificationService.markAsRead(id, !nextUnread);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: nextUnread } : n))
    );
  };

  const handleOpen = async (notif: NotificationItem) => {
    if (notif.unread) {
      await notificationService.markAsRead(notif.id, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
      );
    }
    return notif.link;
  };

  const refresh = () => load(userId);

  return {
    notifications,
    unreadCount,
    handleMarkAllRead,
    handleClearAll,
    handleToggleRead,
    handleOpen,
    refresh,
  };
}
