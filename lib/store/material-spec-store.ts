"use client";

import { useSyncExternalStore } from "react";
import { mockMaterialItems, type MaterialItem, type MaterialCategoryKey } from "@/lib/mock/material-spec";

const STORAGE_KEY = "modusys.materialSpec.v1";

// One flat array tagged by category, same reasoning as architects-store —
// these are all brand-new lookup-table style entities with an identical
// shape (id, name, description, deleted, createdAt), so one store with a
// category filter beats 9 near-identical stores.
let items: MaterialItem[] = mockMaterialItems;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
    if (stored) items = JSON.parse(stored) as MaterialItem[];
  } catch {
    // ignore parse failures, keep seed
  }
}

export type NewMaterialItemInput = {
  category: MaterialCategoryKey;
  name: string;
  description: string;
};

export const materialSpecStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return items;
  },
  getServerSnapshot() {
    return mockMaterialItems;
  },
  createItem(input: NewMaterialItemInput) {
    ensureHydrated();
    const created: MaterialItem = { ...input, id: `mat-new-${Date.now()}`, createdAt: new Date().toISOString() };
    items = [...items, created];
    persist();
    emit();
    return created;
  },
  updateItem(id: string, fields: Partial<Pick<MaterialItem, "name" | "description">>) {
    ensureHydrated();
    items = items.map((i) => (i.id === id ? { ...i, ...fields } : i));
    persist();
    emit();
  },
  // Permanent delete — Super Admin only, gated in the UI layer.
  deleteItem(id: string) {
    ensureHydrated();
    items = items.map((i) => (i.id === id ? { ...i, deleted: true } : i));
    persist();
    emit();
  },
  restoreItem(id: string) {
    ensureHydrated();
    items = items.map((i) => (i.id === id ? { ...i, deleted: false } : i));
    persist();
    emit();
  },
};

export function useMaterialItems(category: MaterialCategoryKey) {
  const all = useSyncExternalStore(
    materialSpecStore.subscribe,
    materialSpecStore.getSnapshot,
    materialSpecStore.getServerSnapshot
  );
  return all.filter((i) => i.category === category && !i.deleted);
}
