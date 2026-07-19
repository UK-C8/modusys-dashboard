import { cn } from "@/lib/utils";
import { statusConfig, type StatusKey } from "@/lib/status";

export function StatusBadge({ status }: { status: StatusKey }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium font-body",
        config.color,
        config.bg
      )}
    >
      {config.label}
    </span>
  );
}
