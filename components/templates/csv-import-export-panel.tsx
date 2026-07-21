"use client";

import { useRef, useState } from "react";
import { Download, Upload, FileDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-col gap-4 rounded-lg border border-grey-100 bg-card p-4">
      <div>
        <h3 className="font-heading text-sm font-semibold text-grey-900">Import / Export</h3>
        <p className="text-xs font-body text-grey-400">Bulk-manage one category at a time via CSV.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-category">Category</Label>
          <select
            id="csv-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategoryKey)}
            className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
          >
            {materialCategories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-mode">Import Mode</Label>
          <select
            id="csv-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ImportMode)}
            className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
          >
            <option value="upsert">Upsert</option>
            <option value="insert-only">Insert Only</option>
            <option value="update-only">Update Only</option>
          </select>
        </div>

        <p className="flex items-start gap-1.5 text-xs font-body text-grey-400 sm:col-start-2 sm:row-start-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {importModeHelp[mode]}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-grey-100 pt-4">
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

        <div className="ml-auto">
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
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
