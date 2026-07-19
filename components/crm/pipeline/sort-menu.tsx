"use client";

import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { customerSortOptions, type CustomerSortOption } from "@/lib/mock/pipeline";
import { cn } from "@/lib/utils";

export function SortMenu({
  value,
  onChange,
  className,
}: {
  value: CustomerSortOption;
  onChange: (value: CustomerSortOption) => void;
  className?: string;
}) {
  const activeLabel = customerSortOptions.find((o) => o.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-grey-100 px-2 py-1 text-xs font-body text-grey-500 transition-colors hover:bg-light-600 hover:text-grey-900",
          className
        )}
      >
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Sort: </span>
        <span className="truncate">{activeLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {customerSortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="px-2.5 py-2 text-sm"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
