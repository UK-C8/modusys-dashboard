"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserPicker } from "@/components/crm/tasks/user-picker";
import { tasksStore } from "@/lib/store/tasks-store";
import { priorities } from "@/lib/constants/priority";
import { getPipelineCustomers } from "@/lib/mock/pipeline";
import { CURRENT_USER_ID } from "@/lib/session";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.string().min(1, "Due date is required"),
  assigneeId: z.string().min(1, "Assignee is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  customerId: z.string(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const customers = getPipelineCustomers();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      assigneeId: CURRENT_USER_ID,
      priority: "normal",
      customerId: "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    tasksStore.createTask({
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      assigneeId: values.assigneeId,
      priority: values.priority,
      customerId: values.customerId || null,
      createdById: CURRENT_USER_ID,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a task and assign it to a team member.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="e.g. Follow up on quote" {...register("title")} />
            {errors.title && <span className="text-xs font-body text-error">{errors.title.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description (optional)</Label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="Add any extra context"
              {...register("description")}
              className="w-full resize-none rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input id="task-due-date" type="date" {...register("dueDate")} />
              {errors.dueDate && <span className="text-xs font-body text-error">{errors.dueDate.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                {...register("priority")}
                className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
              >
                {priorities.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Assignee</Label>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => <UserPicker value={field.value} onChange={field.onChange} />}
            />
            {errors.assigneeId && (
              <span className="text-xs font-body text-error">{errors.assigneeId.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-customer">Linked Customer (optional)</Label>
            <select
              id="task-customer"
              {...register("customerId")}
              defaultValue=""
              className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
            >
              <option value="">None</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className={cn("w-full")}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
