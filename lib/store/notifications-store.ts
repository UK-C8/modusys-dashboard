"use client";

import { useSyncExternalStore } from "react";
import { toastStore } from "@/lib/store/toast-store";
import { CURRENT_USER_ID } from "@/lib/session";

export type NotificationType = "assigned" | "due-soon" | "completed" | "mentioned";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  relatedTaskId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const STORAGE_KEY = "modusys.notifications";
const EMPTY: AppNotification[] = [];

let notifications: AppNotification[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore write failures
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) notifications = JSON.parse(stored) as AppNotification[];
  } catch {
    // ignore parse failures, keep EMPTY
  }
}

export const notificationsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return notifications;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  // Server-side in a real backend this would run on the relevant domain event
  // (task assigned / completed / due-soon cron / mention detected) — here
  // it's called directly from the store method that causes the event.
  notify(input: { userId: string; type: NotificationType; relatedTaskId: string; message: string }) {
    ensureHydrated();
    const notification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    notifications = [notification, ...notifications];
    persist();
    emit();
    // Soft toast only for the highest-priority event, and only when it's for
    // the user currently viewing the app (there's no push channel to anyone
    // else in this mock setup).
    if (input.type === "assigned" && input.userId === CURRENT_USER_ID) {
      toastStore.show(input.message);
    }
  },
  markRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persist();
    emit();
  },
  markAllRead(userId: string) {
    notifications = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    persist();
    emit();
  },
  hasNotified(userId: string, type: NotificationType, relatedTaskId: string) {
    ensureHydrated();
    return notifications.some((n) => n.userId === userId && n.type === type && n.relatedTaskId === relatedTaskId);
  },
};

export function useNotifications() {
  return useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.getSnapshot,
    notificationsStore.getServerSnapshot
  );
}
