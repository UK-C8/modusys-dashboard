"use client";

import { useSyncExternalStore } from "react";
import type { TaskPriority } from "@/lib/constants/priority";
import type { RoleKey } from "@/lib/constants/roles";
import { mockUsers } from "@/lib/mock/users";
import { notificationsStore } from "@/lib/store/notifications-store";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date
  priority: TaskPriority;
  assigneeId: string;
  createdById: string;
  customerId: string | null;
  completed: boolean;
};

const STORAGE_KEY = "modusys.tasks.v2"; // v2: added description/priority/assigneeId/createdById (Phase 4b)
const DUE_SOON_HOURS = 24;

// Seed data — same 3 tasks the Dashboard's Upcoming Tasks panel originally
// shipped with (Phase 1), now reassigned to real org users (u1-u9) instead of
// placeholder names, and extended with the Phase 4b fields.
const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Follow up with Sharma Interiors on quote #Q-1042",
    description: "",
    dueDate: "2026-07-18",
    priority: "high",
    assigneeId: "u6", // Vijay Bhaskar
    createdById: "u1", // Chirag Patel
    customerId: null,
    completed: false,
  },
  {
    id: "t2",
    title: "Site measurement — Kapoor Residence",
    description: "",
    dueDate: "2026-07-19",
    priority: "normal",
    assigneeId: "u7", // Devangee Sailor
    createdById: "u5", // Preeti Madam
    customerId: null,
    completed: false,
  },
  {
    id: "t3",
    title: "Approve PO for hardware batch #HW-220",
    description: "",
    dueDate: "2026-07-21",
    priority: "urgent",
    assigneeId: "u1",
    createdById: "u1",
    customerId: null,
    completed: false,
  },
];

function loadInitial(): Task[] {
  if (typeof window === "undefined") return seedTasks;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Task[]) : seedTasks;
  } catch {
    return seedTasks;
  }
}

// A tiny module-level store (not Zustand — one shared array doesn't need a
// new dependency) so the Dashboard panel and CRM Tasks tab, mounted on
// different pages, both read and mutate the exact same task list.
let tasks: Task[] = seedTasks;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore write failures (e.g. storage disabled)
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function userName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name ?? "Someone";
}

// Due-soon is normally a scheduled backend job, not a client computation —
// this scan approximates that by running once per hydration and skipping
// tasks it's already notified about (deduped via notificationsStore).
function scanDueSoon() {
  const now = Date.now();
  const soon = now + DUE_SOON_HOURS * 60 * 60 * 1000;
  for (const task of tasks) {
    if (task.completed) continue;
    const due = new Date(task.dueDate).getTime();
    if (due < now || due > soon) continue;
    if (notificationsStore.hasNotified(task.assigneeId, "due-soon", task.id)) continue;
    notificationsStore.notify({
      userId: task.assigneeId,
      type: "due-soon",
      relatedTaskId: task.id,
      message: `"${task.title}" is due soon`,
    });
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  tasks = loadInitial();
  hydrated = true;
  scanDueSoon();
}

export const tasksStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return tasks;
  },
  getServerSnapshot() {
    return seedTasks;
  },
  createTask(input: Omit<Task, "id" | "completed">) {
    ensureHydrated();
    const task: Task = { ...input, id: `task-${Date.now()}`, completed: false };
    tasks = [...tasks, task];
    persist();
    emit();
    if (task.assigneeId !== task.createdById) {
      notificationsStore.notify({
        userId: task.assigneeId,
        type: "assigned",
        relatedTaskId: task.id,
        message: `${userName(task.createdById)} assigned you a task: "${task.title}"`,
      });
    }
  },
  toggleComplete(id: string) {
    ensureHydrated();
    let completedTask: Task | undefined;
    tasks = tasks.map((t) => {
      if (t.id !== id) return t;
      const next = { ...t, completed: !t.completed };
      if (next.completed) completedTask = next;
      return next;
    });
    persist();
    emit();
    if (completedTask && completedTask.createdById !== completedTask.assigneeId) {
      notificationsStore.notify({
        userId: completedTask.createdById,
        type: "completed",
        relatedTaskId: completedTask.id,
        message: `${userName(completedTask.assigneeId)} completed "${completedTask.title}"`,
      });
    }
  },
};

export function useTasks() {
  return useSyncExternalStore(
    tasksStore.subscribe,
    tasksStore.getSnapshot,
    tasksStore.getServerSnapshot
  );
}

export type TaskScope = "mine" | "all" | "assigned-by-me";

// Server-side this filtering must happen in the API query, not just in the
// client render — flagged in PHASES.md Phase 4b as a backend TODO. Kept as a
// pure function here so the same rule is shared by the Tasks tab and the
// Dashboard panel instead of two copies drifting apart.
export function visibleTasks(all: Task[], userId: string, role: RoleKey, scope: TaskScope): Task[] {
  const canSeeAll = role === "super-admin" || role === "admin";
  if (scope === "all" && canSeeAll) return all;
  if (scope === "assigned-by-me") return all.filter((t) => t.createdById === userId);
  return all.filter((t) => t.assigneeId === userId || t.createdById === userId);
}
