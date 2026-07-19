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

let media: MediaAttachment[] = seedMedia();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const customerMediaStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return media;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  // TODO: real upload to S3/R2 (Phase B2) — simulates progress + occasional
  // failure so the upload-progress and error UI are real, not decorative.
  addFile(customerId: string, file: File) {
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
