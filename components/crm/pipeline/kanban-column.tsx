"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomerCard } from "@/components/crm/pipeline/customer-card";
import { SortMenu } from "@/components/crm/pipeline/sort-menu";
import { sortCustomers, type Customer, type CustomerSortOption } from "@/lib/mock/pipeline";
import { stageColorTokens, type PipelineStage } from "@/lib/constants/pipelineStages";

export function KanbanColumn({
  stage,
  customers,
  muted,
  className,
}: {
  stage: PipelineStage;
  customers: Customer[];
  muted?: boolean;
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CustomerSortOption>("last-activity");
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });

  const filtered = customers.filter((c) =>
    `${c.name} ${c.address}`.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortCustomers(filtered, sort);
  const colors = stageColorTokens[stage.color];

  return (
    <div
      style={{ backgroundColor: muted ? undefined : colors.light }}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-grey-100 p-3",
        muted && "bg-grey-transparent/60",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex min-w-0 items-center gap-1.5 truncate text-sm font-body font-semibold",
            muted ? "text-grey-400" : "text-grey-800"
          )}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: colors.solid }}
          />
          {stage.label}
        </span>
        <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-xs font-body font-medium text-grey-500">
          {customers.length}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-grey-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-grey-100 bg-card py-1 pl-7 pr-2 text-xs font-body text-grey-700 outline-none placeholder:text-grey-300 focus:border-primary"
          />
        </div>
        <SortMenu value={sort} onChange={setSort} />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-md p-1 transition-colors",
          isOver && "bg-primary-transparent ring-2 ring-primary/40"
        )}
      >
        {sorted.length === 0 ? (
          <EmptyState icon={Users} message="No customers in this stage." />
        ) : (
          sorted.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              stageColor={stage.color}
              muted={muted}
            />
          ))
        )}
      </div>
    </div>
  );
}
