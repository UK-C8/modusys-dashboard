"use client";

import { useSyncExternalStore } from "react";
import { SEEDED_CUSTOMER_IDS } from "@/lib/mock/customer-detail";

export type MediaType = "image" | "video" | "document";

export type MediaAttachment = {
  id: string;
  customerId: string;
  type: MediaType;
  name: string;
  url: string;
  sizeBytes: number;
  durationSec?: number; // videos only
  uploadedAt: string;
  status: "uploading" | "done" | "error";
  progress?: number; // 0-100 while uploading
};

const STORAGE_KEY = "modusys.customerMedia.v1";
const EMPTY: MediaAttachment[] = [];

function seedMedia(): MediaAttachment[] {
  const [c1] = SEEDED_CUSTOMER_IDS;
  const now = Date.now();
  return [
    {
      id: "media-1",
      customerId: c1,
      type: "image",
      name: "site-photo-1.jpg",
      url: "https://picsum.photos/seed/modusys1/480/480",
      sizeBytes: 842_000,
      uploadedAt: new Date(now - 1000 * 60 * 60 * 24 * 6).toISOString(),
      status: "done",
    },
    {
      id: "media-2",
      customerId: c1,
      type: "image",
      name: "kitchen-layout.jpg",
      url: "https://picsum.photos/seed/modusys2/480/480",
      sizeBytes: 1_240_000,
      uploadedAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      status: "done",
    },
    {
      id: "media-3",
      customerId: c1,
      type: "document",
      name: "final-quote-v2.pdf",
      url: "#",
      sizeBytes: 320_000,
      uploadedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "done",
    },
  ];
}

// Previously in-memory only, so a reload wiped every uploaded file entry —
// persisted now the same way chat/tasks/customers already are. Caveat: a
// freshly-uploaded image/video's `url` is a blob: URL (from
// URL.createObjectURL), which the browser invalidates on reload regardless
// of persistence — the row survives, but its thumbnail won't render after a
// refresh. Fixing that needs real upload storage (S3/R2, Phase B2), not
// something localStorage can paper over.
let media: MediaAttachment[] = seedMedia();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
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
    if (stored) media = JSON.parse(stored) as MediaAttachment[];
  } catch {
    // ignore parse failures, keep seed
  }
}

export const customerMediaStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return media;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  // TODO: real upload to S3/R2 (Phase B2) — simulates progress + occasional
  // failure so the upload-progress and error UI are real, not decorative.
  addFile(customerId: string, file: File) {
    ensureHydrated();
    const id = `media-${Date.now()}-${Math.random()}`;
    const type: MediaType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "document";
    const url = type === "document" ? "#" : URL.createObjectURL(file);

    media = [
      ...media,
      {
        id,
        customerId,
        type,
        name: file.name,
        url,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        status: "uploading",
        progress: 0,
      },
    ];
    persist();
    emit();

    const interval = setInterval(() => {
      media = media.map((m) => {
        if (m.id !== id || m.status !== "uploading") return m;
        const next = (m.progress ?? 0) + 20 + Math.random() * 20;
        if (next >= 100) {
          clearInterval(interval);
          const failed = Math.random() < 0.1;
          return { ...m, progress: 100, status: failed ? "error" : "done" };
        }
        return { ...m, progress: next };
      });
      persist();
      emit();
    }, 300);

    return id;
  },
};

export function useCustomerMedia(customerId: string) {
  const all = useSyncExternalStore(
    customerMediaStore.subscribe,
    customerMediaStore.getSnapshot,
    customerMediaStore.getServerSnapshot
  );
  return all.filter((m) => m.customerId === customerId);
}
