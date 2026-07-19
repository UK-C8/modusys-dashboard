"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileTabItems } from "@/lib/nav";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-grey-100 bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      {mobileTabItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-body transition-colors",
              active ? "text-primary" : "text-grey-400 hover:text-grey-700"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            <span className={cn("max-w-full truncate px-1", active && "font-medium")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
