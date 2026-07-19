"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { KanbanColumn } from "@/components/crm/pipeline/kanban-column";
import type { ColumnGroup } from "@/lib/constants/pipelineGroups";
import type { Customer } from "@/lib/mock/pipeline";

export function KanbanGroup({
  group,
  customersByStage,
  expanded,
  onToggle,
}: {
  group: ColumnGroup;
  customersByStage: Record<string, Customer[]>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const total = group.stages.reduce((sum, s) => sum + (customersByStage[s.key]?.length ?? 0), 0);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-14 shrink-0 flex-col items-center justify-between gap-3 rounded-lg border border-dashed border-grey-200 bg-light-600/40 py-3 text-grey-500 transition-colors hover:bg-light-600"
        aria-label={`Expand ${group.label}`}
      >
        <ChevronRight className="h-4 w-4" />
        <span
          className="text-xs font-body font-semibold"
          style={{ writingMode: "vertical-rl" }}
        >
          {group.label} · {total}
        </span>
        <span className="h-1 w-1" />
      </button>
    );
  }

  return (
    <div className="flex shrink-0 gap-2 rounded-lg border border-dashed border-grey-200 bg-light-600/20 p-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-6 shrink-0 flex-col items-center justify-center gap-2 rounded-md text-grey-400 transition-colors hover:bg-light-600 hover:text-grey-700"
        aria-label={`Collapse ${group.label}`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-[10px] font-body font-semibold" style={{ writingMode: "vertical-rl" }}>
          {group.label}
        </span>
      </button>

      <div className="flex gap-3">
        {group.stages.map((stage) => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            customers={customersByStage[stage.key] ?? []}
            className="w-64 bg-card"
          />
        ))}
      </div>
    </div>
  );
}
