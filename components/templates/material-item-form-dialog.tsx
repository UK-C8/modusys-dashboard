"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import type { MaterialCategory, MaterialItem } from "@/lib/mock/material-spec";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function MaterialItemFormDialog({
  open,
  onOpenChange,
  category,
  item,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: MaterialCategory;
  // Absent = Add mode; present = Edit mode, pre-filled.
  item?: MaterialItem;
  onSubmit: (values: ItemFormValues) => void;
}) {
  const isEdit = !!item;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(item ? { name: item.name, description: item.description } : { name: "", description: "" });
  }, [open, item, reset]);

  const submit = (values: ItemFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${category.label}` : `Add ${category.label}`}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this entry." : `Add a new ${category.label.toLowerCase()} option.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mi-name">Name *</Label>
            <Input id="mi-name" placeholder="e.g. Profile Handle — Aluminium" {...register("name")} />
            {errors.name && <span className="text-xs font-body text-error">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mi-description">
              Description {category.longDescription ? "" : "(optional)"}
            </Label>
            {category.longDescription ? (
              <textarea
                id="mi-description"
                rows={3}
                placeholder="Full spec text — finish, grade, use case"
                {...register("description")}
                className="w-full resize-none rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
              />
            ) : (
              <Input id="mi-description" placeholder="Short description" {...register("description")} />
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isEdit ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
