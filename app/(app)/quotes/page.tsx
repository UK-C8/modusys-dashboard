import Link from "next/link";
import { Plus, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function QuotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-grey-900">Quotes</h1>
          <p className="text-sm font-body text-grey-400">Every priced quotation across your customers</p>
        </div>
        <Link href="/quotes/new">
          <Button type="button">
            <Plus className="h-4 w-4" />
            Create New Quote
          </Button>
        </Link>
      </div>

      <EmptyState icon={FileStack} message='No quotes yet. Click "Create New Quote" to price your first quote.' />
    </div>
  );
}
