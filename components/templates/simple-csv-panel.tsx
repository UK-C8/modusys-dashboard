"use client";

import { useRef, useState } from "react";
import { Download, Upload, FileDown, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toastStore } from "@/lib/store/toast-store";

type ImportMode = "upsert" | "insert-only" | "update-only";

const importModeHelp: Record<ImportMode, string> = {
  upsert: "Creates new rows and updates existing ones (matched by name). Safest default for most re-imports.",
  "insert-only": "Only adds rows that don't already exist — existing entries are left untouched, never overwritten.",
  "update-only": "Only updates rows that already exist — skips anything not already in this table, nothing new gets created.",
};

// Same compact one-row toolbar as Material Spec's CSV panel, minus the
// category selector — each sub-tab here is already scoped to one table
// (Furniture export ≠ Hardware export), so there's nothing to pick.
export function SimpleCsvPanel({ label }: { label: string }) {
  const [mode, setMode] = useState<ImportMode>("upsert");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex shrink-0 items-center gap-1">
      <select
        aria-label="Import Mode"
        value={mode}
        onChange={(e) => setMode(e.target.value as ImportMode)}
        className="rounded-lg border border-grey-100 bg-card px-2 py-1.5 text-sm font-body text-grey-900 outline-none focus:border-primary"
      >
        <option value="upsert">Upsert</option>
        <option value="insert-only">Insert Only</option>
        <option value="update-only">Update Only</option>
      </select>
      <Tooltip>
        <TooltipTrigger className="flex items-center text-grey-400 hover:text-grey-600">
          <Info className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{importModeHelp[mode]}</TooltipContent>
      </Tooltip>

      <div className="mx-1 h-6 w-px bg-grey-100" />

      <Tooltip>
        <TooltipTrigger
          aria-label="Download CSV template"
          onClick={() => toastStore.show(`Downloaded CSV template for ${label}`)}
          className="rounded-lg border border-grey-100 p-1.5 text-grey-600 transition-colors hover:bg-light-600 hover:text-primary"
        >
          <FileDown className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Download template</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          aria-label="Export data"
          onClick={() => toastStore.show(`Exported ${label} to CSV`)}
          className="rounded-lg border border-grey-100 p-1.5 text-grey-600 transition-colors hover:bg-light-600 hover:text-primary"
        >
          <Download className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Export data</TooltipContent>
      </Tooltip>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          toastStore.show(`Imported "${file.name}" into ${label} (${mode})`);
          e.target.value = "";
        }}
      />
      <Tooltip>
        <TooltipTrigger
          aria-label="Import CSV"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Upload className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Import CSV</TooltipContent>
      </Tooltip>
    </div>
  );
}
