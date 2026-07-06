import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: 'order' | 'wallet' | 'appointment' | 'service' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string; // ISO date string
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (list: Notification[]) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => {
      const exists = state.notifications.some((existing) => existing.id === n.id);
      if (exists) return state; // prevent duplicates
      const newList = [n, ...state.notifications];
      return {
        notifications: newList,
        unreadCount: newList.filter((item) => !item.isRead).length,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const newList = state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );
      return {
        notifications: newList,
        unreadCount: newList.filter((item) => !item.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    })),

  setNotifications: (list) =>
    set({
      notifications: list,
      unreadCount: list.filter((item) => !item.isRead).length,
    }),
}));