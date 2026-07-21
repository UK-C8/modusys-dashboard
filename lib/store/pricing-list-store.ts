"use client";

import { useSyncExternalStore } from "react";
import {
  mockFurniturePriceItems,
  mockHardwarePriceItems,
  type FurniturePriceItem,
  type HardwarePriceItem,
} from "@/lib/mock/pricing-list";

const FURNITURE_KEY = "modusys.furniturePriceList.v1";
const HARDWARE_KEY = "modusys.hardwarePriceList.v1";

// Same pattern as material-spec-store — one flat array, soft delete via a
// `deleted` flag, no active/inactive status (dropped per business call on
// Material Spec, applied consistently here too).
let furnitureItems: FurniturePriceItem[] = mockFurniturePriceItems;
let hardwareItems: HardwarePriceItem[] = mockHardwarePriceItems;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(FURNITURE_KEY, JSON.stringify(furnitureItems));
    window.localStorage.setItem(HARDWARE_KEY, JSON.stringify(hardwareItems));
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
    const f = window.localStorage.getItem(FURNITURE_KEY);
    if (f) furnitureItems = JSON.parse(f) as FurniturePriceItem[];
    const h = window.localStorage.getItem(HARDWARE_KEY);
    if (h) hardwareItems = JSON.parse(h) as HardwarePriceItem[];
  } catch {
    // ignore parse failures, keep seed
  }
}

export type NewFurniturePriceInput = Omit<FurniturePriceItem, "id" | "createdAt">;
export type NewHardwarePriceInput = Omit<HardwarePriceItem, "id" | "createdAt">;

export const pricingListStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getFurnitureSnapshot() {
    ensureHydrated();
    return furnitureItems;
  },
  getFurnitureServerSnapshot() {
    return mockFurniturePriceItems;
  },
  getHardwareSnapshot() {
    ensureHydrated();
    return hardwareItems;
  },
  getHardwareServerSnapshot() {
    return mockHardwarePriceItems;
  },

  // Duplicate-combination guard — returns the existing row if this exact
  // Thickness+Type+Internal+External combo is already priced, else null.
  findDuplicateFurniture(input: NewFurniturePriceInput, excludeId?: string): FurniturePriceItem | null {
    ensureHydrated();
    return (
      furnitureItems.find(
        (i) =>
          !i.deleted &&
          i.id !== excludeId &&
          i.thicknessId === input.thicknessId &&
          i.rawMaterialTypeId === input.rawMaterialTypeId &&
          i.internalColourId === input.internalColourId &&
          i.externalColourId === input.externalColourId
      ) ?? null
    );
  },
  createFurnitureItem(input: NewFurniturePriceInput) {
    ensureHydrated();
    const created: FurniturePriceItem = { ...input, id: `fpl-new-${Date.now()}`, createdAt: new Date().toISOString() };
    furnitureItems = [...furnitureItems, created];
    persist();
    emit();
    return created;
  },
  updateFurnitureItem(id: string, fields: NewFurniturePriceInput) {
    ensureHydrated();
    furnitureItems = furnitureItems.map((i) => (i.id === id ? { ...i, ...fields } : i));
    persist();
    emit();
  },
  deleteFurnitureItem(id: string) {
    ensureHydrated();
    furnitureItems = furnitureItems.map((i) => (i.id === id ? { ...i, deleted: true } : i));
    persist();
    emit();
  },
  restoreFurnitureItem(id: string) {
    ensureHydrated();
    furnitureItems = furnitureItems.map((i) => (i.id === id ? { ...i, deleted: false } : i));
    persist();
    emit();
  },

  isArticleNoTaken(articleNo: string, excludeId?: string) {
    ensureHydrated();
    return hardwareItems.some(
      (i) => !i.deleted && i.id !== excludeId && i.articleNo.toLowerCase() === articleNo.toLowerCase()
    );
  },
  createHardwareItem(input: NewHardwarePriceInput) {
    ensureHydrated();
    const created: HardwarePriceItem = { ...input, id: `hpl-new-${Date.now()}`, createdAt: new Date().toISOString() };
    hardwareItems = [...hardwareItems, created];
    persist();
    emit();
    return created;
  },
  updateHardwareItem(id: string, fields: Partial<NewHardwarePriceInput>) {
    ensureHydrated();
    hardwareItems = hardwareItems.map((i) => (i.id === id ? { ...i, ...fields } : i));
    persist();
    emit();
  },
  deleteHardwareItem(id: string) {
    ensureHydrated();
    hardwareItems = hardwareItems.map((i) => (i.id === id ? { ...i, deleted: true } : i));
    persist();
    emit();
  },
  restoreHardwareItem(id: string) {
    ensureHydrated();
    hardwareItems = hardwareItems.map((i) => (i.id === id ? { ...i, deleted: false } : i));
    persist();
    emit();
  },
  // Bulk actions — pricing revisions at 200+ SKU catalog scale need this,
  // not just one-row-at-a-time editing.
  bulkAddCategory(ids: string[], category: string) {
    ensureHydrated();
    const idSet = new Set(ids);
    hardwareItems = hardwareItems.map((i) =>
      idSet.has(i.id) && !i.categories.includes(category) ? { ...i, categories: [...i.categories, category] } : i
    );
    persist();
    emit();
  },
  bulkSetBrand(ids: string[], brand: string) {
    ensureHydrated();
    const idSet = new Set(ids);
    hardwareItems = hardwareItems.map((i) => (idSet.has(i.id) ? { ...i, brand } : i));
    persist();
    emit();
  },
  bulkAdjustDiscount(ids: string[], deltaPct: number) {
    ensureHydrated();
    const idSet = new Set(ids);
    hardwareItems = hardwareItems.map((i) =>
      idSet.has(i.id) ? { ...i, discountPct: Math.min(100, Math.max(0, i.discountPct + deltaPct)) } : i
    );
    persist();
    emit();
  },
};

export function useFurniturePriceItems() {
  const all = useSyncExternalStore(
    pricingListStore.subscribe,
    pricingListStore.getFurnitureSnapshot,
    pricingListStore.getFurnitureServerSnapshot
  );
  return all.filter((i) => !i.deleted);
}

export function useHardwarePriceItems() {
  const all = useSyncExternalStore(
    pricingListStore.subscribe,
    pricingListStore.getHardwareSnapshot,
    pricingListStore.getHardwareServerSnapshot
  );
  return all.filter((i) => !i.deleted);
}
