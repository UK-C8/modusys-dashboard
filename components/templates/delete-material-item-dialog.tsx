"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { MaterialCategory, MaterialItem } from "@/lib/mock/material-spec";

export function DeleteMaterialItemDialog({
  open,
  onOpenChange,
  category,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: MaterialCategory;
  item: MaterialItem | null;
  onConfirm: () => void;
}) {
  if (!item) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete "{item.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This {category.label.toLowerCase()} value may already be referenced on existing quotes —
            deleting it here does not update those quotes, they'll keep showing this value as
            historical text, but it will no longer be selectable for new ones.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 rounded-lg bg-error-transparent px-3 py-2 text-sm font-body text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          This is permanent and cannot be undone — consider deactivating instead.
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-error text-white hover:bg-error/90">
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
