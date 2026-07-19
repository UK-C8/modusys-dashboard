"use client";

import { useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { AlertCircle } from "lucide-react";
import { KanbanColumn } from "@/components/crm/pipeline/kanban-column";
import { KanbanGroup } from "@/components/crm/pipeline/kanban-group";
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
import { columnGroups } from "@/lib/constants/pipelineGroups";
import { pipelineStages, type PipelineStageKey } from "@/lib/constants/pipelineStages";
import type { Customer } from "@/lib/mock/pipeline";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

const CLOSED_STAGES = new Set<PipelineStageKey>(["site-completed", "cancel-order"]);

export function KanbanBoard({
  customers,
  onMove,
  stageFilter,
}: {
  customers: Customer[];
  onMove: (customerId: string, nextStage: PipelineStageKey) => Promise<void>;
  stageFilter: PipelineStageKey | "all";
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [showClosed, setShowClosed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useLocalStorage<string[]>(
    "modusys.pipeline.expandedGroups",
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    customerId: string;
    customerName: string;
    nextStage: PipelineStageKey;
    nextStageLabel: string;
  } | null>(null);

  const customersByStage = useMemo(() => {
    const map: Record<string, Customer[]> = {};
    for (const customer of customers) {
      (map[customer.stage] ??= []).push(customer);
    }
    return map;
  }, [customers]);

  // A stage filter overrides clustering entirely — the user asked to see
  // only that one stage, not the cluster it happens to belong to.
  const filteredStage =
    stageFilter !== "all" ? pipelineStages.find((s) => s.key === stageFilter) : null;

  const visibleGroups = filteredStage
    ? []
    : columnGroups.filter((group) => {
        if (showClosed) return true;
        return !group.stages.every((s) => CLOSED_STAGES.has(s.key));
      });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const customerId = String(active.id);
    const nextStage = String(over.id) as PipelineStageKey;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || customer.stage === nextStage) return;

    setPendingMove({
      customerId,
      customerName: customer.name,
      nextStage,
      nextStageLabel: pipelineStages.find((s) => s.key === nextStage)?.label ?? nextStage,
    });
  };

  const confirmMove = async () => {
    if (!pendingMove) return;
    const { customerId, nextStage } = pendingMove;
    setPendingMove(null);

    try {
      await onMove(customerId, nextStage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move customer.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-body text-grey-500">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          Show closed stages
        </label>

        {error && (
          <span className="flex items-center gap-1.5 rounded-md bg-error-transparent px-2.5 py-1 text-xs font-body text-error">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </span>
        )}
      </div>

      <DndContext id="pipeline-kanban" sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredStage && (
            <KanbanColumn
              stage={filteredStage}
              customers={customersByStage[filteredStage.key] ?? []}
              muted={filteredStage.key === "cancel-order"}
            />
          )}
          {visibleGroups.map((group) => {
            const isSingleClosed =
              group.stages.length === 1 && CLOSED_STAGES.has(group.stages[0].key);

            if (!group.isCluster) {
              const stage = group.stages[0];
              return (
                <KanbanColumn
                  key={group.key}
                  stage={stage}
                  customers={customersByStage[stage.key] ?? []}
                  muted={isSingleClosed && stage.key === "cancel-order"}
                />
              );
            }

            return (
              <KanbanGroup
                key={group.key}
                group={group}
                customersByStage={customersByStage}
                expanded={expandedGroups.includes(group.key)}
                onToggle={() => toggleGroup(group.key)}
              />
            );
          })}
        </div>
      </DndContext>

      <AlertDialog open={pendingMove !== null} onOpenChange={(open) => !open && setPendingMove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {pendingMove?.customerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Add {pendingMove?.customerName} to <strong>{pendingMove?.nextStageLabel}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove}>Yes, move</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
