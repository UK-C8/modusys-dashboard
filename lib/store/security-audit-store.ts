"use client";

import { useSyncExternalStore } from "react";

export type SecurityAuditEvent = {
  id: string;
  message: string;
  createdAt: string; // ISO date
};

const STORAGE_KEY = "modusys.securityAudit.v1";
const EMPTY: SecurityAuditEvent[] = [];

let events: SecurityAuditEvent[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    // Only the most recent 20 are kept — "last 10-20 events, no separate
    // audit-log page needed for this phase" per spec.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 20)));
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
    if (stored) events = JSON.parse(stored) as SecurityAuditEvent[];
  } catch {
    // ignore parse failures, keep EMPTY
  }
}

export const securityAuditStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return events;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  // TODO: real POST /audit-log call once a SecurityAuditLog table exists
  // server-side (Phase B3) — this is client-only and won't survive a
  // cleared localStorage, fine for this phase's "visible trail" purpose.
  logEvent(message: string) {
    ensureHydrated();
    events = [{ id: `audit-${Date.now()}-${Math.random()}`, message, createdAt: new Date().toISOString() }, ...events].slice(0, 20);
    persist();
    emit();
  },
};

export function useSecurityAuditLog() {
  return useSyncExternalStore(
    securityAuditStore.subscribe,
    securityAuditStore.getSnapshot,
    securityAuditStore.getServerSnapshot
  );
}
