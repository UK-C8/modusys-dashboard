"use client";

import { useSyncExternalStore } from "react";
import { mockCustomers, type Customer } from "@/lib/mock/pipeline";
import { profileOverridesStore } from "@/lib/store/customer-profile-overrides-store";

const STORAGE_KEY = "modusys.customers.v1";

type StoredState = { created: Customer[]; deletedIds: string[] };

function loadInitial(): StoredState {
  if (typeof window === "undefined") return { created: [], deletedIds: [] };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredState) : { created: [], deletedIds: [] };
  } catch {
    return { created: [], deletedIds: [] };
  }
}

// Additive layer over the seeded mockCustomers array — new customers created
// via the Add Customer modal, and soft-deletes (an id list, not row removal),
// so nothing here ever mutates the deterministic mock data itself.
let created: Customer[] = [];
let deletedIds: string[] = [];
let all: Customer[] = mockCustomers;
let hydrated = false;
const listeners = new Set<() => void>();

function recompute() {
  const deleted = new Set(deletedIds);
  all = [...mockCustomers, ...created].filter((c) => !deleted.has(c.id));
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ created, deletedIds }));
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
  const state = loadInitial();
  created = state.created;
  deletedIds = state.deletedIds;
  recompute();
}

export type NewCustomerInput = {
  name: string;
  mobile: string;
  email: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  birthdayMonth: string;
  birthdayDay: string;
  createdById: string;
};

export const customersStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return all;
  },
  getServerSnapshot() {
    return mockCustomers;
  },
  createCustomer(input: NewCustomerInput) {
    ensureHydrated();
    const id = `cust-new-${Date.now()}`;
    const fullAddress = [input.address, input.city].filter(Boolean).join(", ");
    const customer: Customer = {
      id,
      name: input.name,
      address: fullAddress,
      stage: "upcoming-inquiry",
      finalOfferLakh: null,
      assignee: input.createdById,
      lastActivity: new Date().toISOString(),
      daysInStage: 0,
    };
    created = [...created, customer];
    recompute();
    persist();
    emit();
    profileOverridesStore.setFields(id, {
      email: input.email,
      phone: input.mobile,
      gst: input.gst,
      area: input.address,
      city: input.city,
      state: input.state,
      postcode: input.postcode,
      birthdayMonth: input.birthdayMonth,
      birthdayDay: input.birthdayDay,
      updatedAt: customer.lastActivity,
      updatedById: input.createdById,
    });
    return customer;
  },
  // Soft delete: row disappears immediately, but stays restorable until the
  // Undo toast window (10s) elapses — nothing is actually purged here since
  // the business wants cascaded records (quotes/media/chat) preserved, not
  // deleted, so there's no cascade to perform on top of this id hide.
  deleteCustomer(id: string) {
    ensureHydrated();
    deletedIds = [...deletedIds, id];
    recompute();
    persist();
    emit();
  },
  restoreCustomer(id: string) {
    ensureHydrated();
    deletedIds = deletedIds.filter((d) => d !== id);
    recompute();
    persist();
    emit();
  },
};

export function useCustomers() {
  return useSyncExternalStore(
    customersStore.subscribe,
    customersStore.getSnapshot,
    customersStore.getServerSnapshot
  );
}
