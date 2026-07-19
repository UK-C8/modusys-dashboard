"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { stageColorTokens, type PipelineStageColor } from "@/lib/constants/pipelineStages";
import { customerPanelStore } from "@/lib/store/customer-panel-store";
import type { Customer } from "@/lib/mock/pipeline";

export function CustomerCard({
  customer,
  stageColor,
  muted,
}: {
  customer: Customer;
  stageColor: PipelineStageColor;
  muted?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: customer.id,
  });
  const colors = stageColorTokens[stageColor];

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => customerPanelStore.open(customer.id)}
      style={{
        backgroundColor: muted ? undefined : colors.light,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      className={cn(
        "group relative flex cursor-grab touch-none flex-col gap-1.5 rounded-lg border border-grey-100 bg-card py-2.5 pl-3 pr-2 text-left shadow-sm transition-shadow active:cursor-grabbing",
        isDragging && "z-10 opacity-60 shadow-lg",
        muted && "opacity-60"
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: colors.solid }}
      />

      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-body font-medium text-grey-900">{customer.name}</span>
        <GripVertical
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 text-grey-300 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      <span className="flex items-center gap-1 text-xs font-body text-grey-400">
        <MapPin className="h-3 w-3 shrink-0" />
        {customer.address}
      </span>

      {customer.finalOfferLakh !== null && (
        <span className="text-xs font-body font-medium text-grey-700">
          Final Offer: ₹{customer.finalOfferLakh.toFixed(1)}L
        </span>
      )}
    </div>
  );
}
