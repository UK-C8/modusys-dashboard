"use client";

import { useMemo, useState } from "react";
import { Plus, ListTodo, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskRow } from "@/components/crm/tasks/task-row";
import { TaskFormDialog } from "@/components/crm/tasks/task-form-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useTasks, visibleTasks, type TaskScope } from "@/lib/store/tasks-store";
import { getCurrentUser } from "@/lib/session";
import { mockUsers } from "@/lib/mock/users";
import { cn } from "@/lib/utils";

type StatusFilter = "pending" | "completed" | "all";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export function TasksTab() {
  const currentUser = getCurrentUser();
  const canSeeAll = currentUser.role === "super-admin" || currentUser.role === "admin";
  const scopeOptions: { label: string; value: TaskScope }[] = [
    ...(canSeeAll ? [{ label: "All Tasks", value: "all" as TaskScope }] : []),
    { label: "My Tasks", value: "mine" as TaskScope },
    { label: "Assigned by Me", value: "assigned-by-me" as TaskScope },
  ];

  const allTasks = useTasks();
  const [scope, setScope] = useState<TaskScope>(canSeeAll ? "all" : "mine");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [groupByAssignee, setGroupByAssignee] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const scoped = useMemo(
    () => visibleTasks(allTasks, currentUser.id, currentUser.role === "no-role" ? "staff" : currentUser.role, scope),
    [allTasks, currentUser, scope]
  );

  const filteredTasks = useMemo(() => {
    const sorted = [...scoped].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    if (status === "pending") return sorted.filter((t) => !t.completed);
    if (status === "completed") return sorted.filter((t) => t.completed);
    return sorted;
  }, [scoped, status]);

  const grouped = useMemo(() => {
    if (!groupByAssignee) return null;
    const map = new Map<string, typeof filteredTasks>();
    for (const task of filteredTasks) {
      const list = map.get(task.assigneeId) ?? [];
      list.push(task);
      map.set(task.assigneeId, list);
    }
    return map;
  }, [filteredTasks, groupByAssignee]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-light-600 p-0.5">
            {scopeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setScope(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-body font-medium transition-colors",
                  scope === option.value
                    ? "bg-card text-primary shadow-sm"
                    : "text-grey-400 hover:text-grey-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-grey-100" />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-grey-100 bg-card px-3 py-1.5 text-sm font-body font-medium text-grey-700 transition-colors hover:bg-light-600">
              {statusOptions.find((o) => o.value === status)?.label}
              <ChevronDown className="h-3.5 w-3.5 text-grey-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-40">
              <DropdownMenuRadioGroup
                value={status}
                onValueChange={(value) => setStatus(value as StatusFilter)}
              >
                {statusOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {scope === "all" && (
            <label className="flex items-center gap-2 text-sm font-body text-grey-500">
              <input
                type="checkbox"
                checked={groupByAssignee}
                onChange={(e) => setGroupByAssignee(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              Group by assignee
            </label>
          )}
        </div>

        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          message={
            status === "completed"
              ? "No completed tasks yet."
              : "No tasks here. Create one to get started."
          }
          cta={{ label: "Create Task", onClick: () => setFormOpen(true) }}
        />
      ) : grouped ? (
        <div className="flex flex-col gap-4">
          {[...grouped.entries()].map(([assigneeId, tasks]) => (
            <div key={assigneeId} className="flex flex-col gap-2">
              <span className="text-xs font-body font-medium uppercase tracking-wide text-grey-400">
                {mockUsers.find((u) => u.id === assigneeId)?.name ?? "Unknown"} · {tasks.length}
              </span>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
