"use client";

import { useSyncExternalStore } from "react";
import { mockQuotes, type Quote } from "@/lib/mock/quote";

const STORAGE_KEY = "modusys.quotes.v1";

let quotes: Quote[] = mockQuotes;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
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
    if (stored) quotes = JSON.parse(stored) as Quote[];
  } catch {
    // ignore parse failures, keep seed
  }
}

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

// QT-DDMMYY-NN — sequence resets per calendar day, based on how many quotes
// already carry that day's date prefix (not a persisted counter), matching
// the format already established elsewhere in the app.
export function generateQuoteNumber(existing: Quote[], date = new Date()): string {
  const dd = pad(date.getDate(), 2);
  const mm = pad(date.getMonth() + 1, 2);
  const yy = pad(date.getFullYear() % 100, 2);
  const prefix = `QT-${dd}${mm}${yy}-`;
  const sameDay = existing.filter((q) => q.quoteNumber.startsWith(prefix));
  return `${prefix}${pad(sameDay.length + 1, 2)}`;
}

export const quotesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return quotes;
  },
  getServerSnapshot() {
    return mockQuotes;
  },
  nextQuoteNumber() {
    ensureHydrated();
    return generateQuoteNumber(quotes);
  },
  saveQuote(quote: Quote) {
    ensureHydrated();
    const existingIndex = quotes.findIndex((q) => q.id === quote.id);
    const updated = { ...quote, updatedAt: new Date().toISOString() };
    quotes = existingIndex >= 0 ? quotes.map((q, i) => (i === existingIndex ? updated : q)) : [...quotes, updated];
    persist();
    emit();
    return updated;
  },
};

export function useQuotes() {
  return useSyncExternalStore(quotesStore.subscribe, quotesStore.getSnapshot, quotesStore.getServerSnapshot);
}
