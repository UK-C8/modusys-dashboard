"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { tasksStore, type Task } from "@/lib/store/tasks-store";
import { getPipelineCustomers } from "@/lib/mock/pipeline";
import { mockUsers } from "@/lib/mock/users";
import { getPriority } from "@/lib/constants/priority";
import { taskPanelStore } from "@/lib/store/task-panel-store";

function formatDueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function userName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name ?? "Unknown";
}

export function TaskRow({ task }: { task: Task }) {
  const customer = task.customerId
    ? getPipelineCustomers().find((c) => c.id === task.customerId)
    : null;
  const priority = getPriority(task.priority);
  const differentPeople = task.createdById !== task.assigneeId;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => taskPanelStore.open(task.id)}
      onKeyDown={(e) => e.key === "Enter" && taskPanelStore.open(task.id)}
      className="flex items-center gap-3 rounded-lg border border-grey-100 bg-card px-4 py-3 cursor-pointer hover:border-primary-200"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onClick={(e) => e.stopPropagation()}
        onChange={() => tasksStore.toggleComplete(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        className="h-4 w-4 shrink-0 accent-primary"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-body text-grey-800",
              task.completed && "text-grey-400 line-through"
            )}
          >
            {task.title}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium font-body", priority.light, priority.solid)}>
            {priority.label}
          </span>
        </div>
        <span className="text-xs font-body text-grey-400">
          Due {formatDueDate(task.dueDate)} ·{" "}
          {differentPeople ? `${userName(task.createdById)} → ${userName(task.assigneeId)}` : userName(task.assigneeId)}
          {customer && (
            <>
              {" · "}
              <span className="inline-flex items-center gap-1 text-grey-500">
                <Users className="h-3 w-3" />
                {customer.name}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
