"use client";

import { useRef, useState } from "react";
import { Download, Upload, FileDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toastStore } from "@/lib/store/toast-store";
import { materialCategories, type MaterialCategoryKey } from "@/lib/mock/material-spec";

type ImportMode = "upsert" | "insert-only" | "update-only";

const importModeHelp: Record<ImportMode, string> = {
  upsert: "Creates new rows and updates existing ones (matched by name). Safest default for most re-imports.",
  "insert-only": "Only adds rows that don't already exist — existing entries are left untouched, never overwritten.",
  "update-only": "Only updates rows that already exist — skips anything not already in this category, nothing new gets created.",
};

// Scoped per-category (per spec) rather than one giant combined export —
// mirrors how Shutters/Hardware already scope import/export to their own
// table. Mock only: no real CSV parsing, just the UI + confirmation.
export function CsvImportExportPanel() {
  const [category, setCategory] = useState<MaterialCategoryKey>(materialCategories[0].key);
  const [mode, setMode] = useState<ImportMode>("upsert");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryLabel = materialCategories.find((c) => c.key === category)?.label ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-grey-100 bg-card p-3">
      <select
        aria-label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value as MaterialCategoryKey)}
        className="rounded-lg border border-grey-100 bg-card px-3 py-1.5 text-sm font-body text-grey-900 outline-none focus:border-primary"
      >
        {materialCategories.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => toastStore.show(`Downloaded CSV template for ${categoryLabel}`)}
      >
        <FileDown className="h-4 w-4" />
        Template
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toastStore.show(`Exported ${categoryLabel} to CSV`)}
      >
        <Download className="h-4 w-4" />
        Export Data
      </Button>

      <div className="mx-1 h-6 w-px bg-grey-100" />

      <div className="flex items-center gap-1">
        <select
          aria-label="Import Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as ImportMode)}
          className="rounded-lg border border-grey-100 bg-card px-3 py-1.5 text-sm font-body text-grey-900 outline-none focus:border-primary"
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
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          toastStore.show(`Imported "${file.name}" into ${categoryLabel} (${mode})`);
          e.target.value = "";
        }}
      />
      <Button size="sm" className="ml-auto" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>
    </div>
  );
}
