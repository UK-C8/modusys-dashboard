"use client";

import { useSyncExternalStore } from "react";
import { SEEDED_CUSTOMER_IDS } from "@/lib/mock/customer-detail";

export type CustomerMessage = {
  id: string;
  customerId: string;
  kind: "chat" | "system" | "voice";
  senderId: string | null; // null for system events
  text?: string;
  mentionedUserIds?: string[];
  audioUrl?: string;
  durationSec?: number;
  createdAt: string;
  status: "sent" | "pending" | "error";
};

const EMPTY: CustomerMessage[] = [];

function seedMessages(): CustomerMessage[] {
  const [c1, c2] = SEEDED_CUSTOMER_IDS;
  const now = Date.now();
  return [
    {
      id: "m1",
      customerId: c1,
      kind: "system",
      senderId: null,
      text: "Stage changed to Quotation",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 6).toISOString(),
      status: "sent",
    },
    {
      id: "m2",
      customerId: c1,
      kind: "chat",
      senderId: "u1",
      text: "Sent the revised quote — waiting to hear back.",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      status: "sent",
    },
    {
      id: "m3",
      customerId: c1,
      kind: "chat",
      senderId: "u5",
      text: "Thanks! I'll follow up tomorrow.",
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      status: "sent",
    },
    {
      id: "m4",
      customerId: c2,
      kind: "system",
      senderId: null,
      text: "Final offer updated to ₹8.7L",
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      status: "sent",
    },
  ];
}

let messages: CustomerMessage[] = seedMessages();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const customerMessagesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return messages;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  // TODO: real POST /customers/:id/messages call (Phase B2). Simulates
  // latency + an occasional failure so the retry-on-failure UI is real.
  async sendMessage(customerId: string, text: string, senderId: string, mentionedUserIds: string[]) {
    const id = `msg-${Date.now()}`;
    messages = [
      ...messages,
      {
        id,
        customerId,
        kind: "chat",
        senderId,
        text,
        mentionedUserIds,
        createdAt: new Date().toISOString(),
        status: "pending",
      },
    ];
    emit();

    // TODO: real notification hook — POST /notifications per mentioned user.
    if (mentionedUserIds.length) {
      // no-op placeholder call site for the backend hook described in spec
    }

    await new Promise((r) => setTimeout(r, 500));
    const failed = Math.random() < 0.12;
    messages = messages.map((m) => (m.id === id ? { ...m, status: failed ? "error" : "sent" } : m));
    emit();
  },
  async retryMessage(id: string) {
    messages = messages.map((m) => (m.id === id ? { ...m, status: "pending" } : m));
    emit();
    await new Promise((r) => setTimeout(r, 500));
    messages = messages.map((m) => (m.id === id ? { ...m, status: "sent" } : m));
    emit();
  },
  addVoiceMessage(customerId: string, senderId: string, audioUrl: string, durationSec: number) {
    messages = [
      ...messages,
      {
        id: `voice-${Date.now()}`,
        customerId,
        kind: "voice",
        senderId,
        audioUrl,
        durationSec,
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    ];
    emit();
  },
  addSystemEvent(customerId: string, text: string) {
    messages = [
      ...messages,
      {
        id: `sys-${Date.now()}`,
        customerId,
        kind: "system",
        senderId: null,
        text,
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    ];
    emit();
  },
};

export function useCustomerMessages(customerId: string) {
  const all = useSyncExternalStore(
    customerMessagesStore.subscribe,
    customerMessagesStore.getSnapshot,
    customerMessagesStore.getServerSnapshot
  );
  return all.filter((m) => m.customerId === customerId);
}
