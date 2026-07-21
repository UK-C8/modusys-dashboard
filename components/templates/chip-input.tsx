"use client";

import { useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Multi-value tag input — pick from a seeded option list via a searchable
// dropdown, or type a new value not in the list yet. Used for Hardware's
// Category field (genuinely multi-value per spec).
export function ChipInput({
  values,
  onChange,
  options,
  placeholder = "Add...",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = options.filter(
    (o) => !values.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  );
  const canAddNew = query.trim().length > 0 && !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const add = (value: string) => {
    if (!values.includes(value)) onChange([...values, value]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-grey-100 bg-card p-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="flex items-center gap-1 rounded-full bg-primary-transparent px-2.5 py-1 text-xs font-body font-medium text-primary"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label={`Remove ${v}`}
            className="rounded-full hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-body font-medium text-grey-500 hover:bg-light-600",
            values.length === 0 && "text-grey-400"
          )}
        >
          <Plus className="h-3 w-3" />
          {values.length === 0 ? placeholder : "Add"}
          <ChevronDown className="h-3 w-3" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <Input
            autoFocus
            placeholder="Search or type new"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAddNew) {
                e.preventDefault();
                add(query.trim());
              }
            }}
            className="mb-2"
          />
          <div className="flex max-h-40 flex-col overflow-y-auto">
            {results.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => add(o)}
                className="rounded-md px-2 py-1.5 text-left text-sm font-body text-grey-800 hover:bg-light-600"
              >
                {o}
              </button>
            ))}
            {canAddNew && (
              <button
                type="button"
                onClick={() => add(query.trim())}
                className="rounded-md px-2 py-1.5 text-left text-sm font-body font-medium text-primary hover:bg-light-600"
              >
                + Add "{query.trim()}"
              </button>
            )}
            {results.length === 0 && !canAddNew && (
              <span className="px-2 py-1.5 text-sm font-body text-grey-400">No matches</span>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
