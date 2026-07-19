"use client";

import { LayoutGrid, List, SlidersHorizontal, ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { pipelineStages, type PipelineStageKey } from "@/lib/constants/pipelineStages";
import { cn } from "@/lib/utils";

export type PipelineView = "kanban" | "list";

export function PipelineToolbar({
  stageFilter,
  onStageFilterChange,
  view,
  onViewChange,
  onOpenFilters,
  onCollapseAll,
  onExpandAll,
}: {
  stageFilter: PipelineStageKey | "all";
  onStageFilterChange: (value: PipelineStageKey | "all") => void;
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
  onOpenFilters: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
}) {
  const activeStageLabel =
    stageFilter === "all" ? "All Stages" : pipelineStages.find((s) => s.key === stageFilter)?.label;

  return (
    <div className="flex items-center gap-3 overflow-x-auto sm:flex-wrap sm:justify-between">
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-grey-100 bg-card px-3 py-1.5 text-sm font-body text-grey-700 transition-colors hover:bg-light-600">
            {activeStageLabel}
            <ChevronDown className="h-3.5 w-3.5 text-grey-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-56">
            <DropdownMenuItem onClick={() => onStageFilterChange("all")} className="px-2.5 py-2 text-sm">
              All Stages
            </DropdownMenuItem>
            {pipelineStages.map((stage) => (
              <DropdownMenuItem
                key={stage.key}
                onClick={() => onStageFilterChange(stage.key)}
                className="px-2.5 py-2 text-sm"
              >
                {stage.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onOpenFilters} className="shrink-0 whitespace-nowrap">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {view === "list" && (
          <>
            <Button variant="ghost" size="sm" onClick={onExpandAll} className="shrink-0 whitespace-nowrap">
              <ChevronsUpDown className="h-4 w-4" />
              Expand all
            </Button>
            <Button variant="ghost" size="sm" onClick={onCollapseAll} className="shrink-0 whitespace-nowrap">
              <ChevronsDownUp className="h-4 w-4" />
              Collapse all
            </Button>
          </>
        )}

        <div className="flex shrink-0 rounded-lg bg-light-600 p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("kanban")}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-body font-medium transition-colors",
              view === "kanban" ? "bg-card text-primary shadow-sm" : "text-grey-400 hover:text-grey-700"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-body font-medium transition-colors",
              view === "list" ? "bg-card text-primary shadow-sm" : "text-grey-400 hover:text-grey-700"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>
    </div>
  );
}
