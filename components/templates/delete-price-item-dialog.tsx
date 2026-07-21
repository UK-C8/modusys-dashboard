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

// Shared by Furniture and Hardware Price List delete confirmations — same
// deactivate-first philosophy as Material Spec/Unit Types (permanent delete
// is a real risk here since historical quotes likely reference these rows).
export function DeletePriceItemDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | null;
  onConfirm: () => void;
}) {
  if (!title) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete "{title}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This pricing entry may already be referenced on historical quotes — deleting it here does not
            change those quotes, they'll keep showing this rate as historical text, but it will no longer be
            selectable for new ones.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 rounded-lg bg-error-transparent px-3 py-2 text-sm font-body text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          This is permanent and cannot be undone.
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
