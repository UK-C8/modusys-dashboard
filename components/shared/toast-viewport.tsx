"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { useToasts, toastStore } from "@/lib/store/toast-store";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-body font-medium shadow-lg",
            toast.variant === "success"
              ? "bg-success-transparent text-success"
              : "bg-error-transparent text-error"
          )}
        >
          {toast.variant === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                toastStore.dismiss(toast.id);
              }}
              className="ml-1 font-semibold underline underline-offset-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
