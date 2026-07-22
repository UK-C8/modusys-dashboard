"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ClientDetailsSection } from "@/components/quotes/create/client-details-section";
import { MaterialSpecificationSection } from "@/components/quotes/create/material-specification-section";
import { UnitsSection } from "@/components/quotes/create/units-section";
import { PricingSummary } from "@/components/quotes/create/pricing-summary";
import { blankQuote } from "@/lib/mock/quote";
import { applyShutterFinishToUnits } from "@/lib/quote-pricing";
import { quotesStore } from "@/lib/store/quotes-store";
import { quoteTemplateStore } from "@/lib/store/quote-template-store";
import { toastStore } from "@/lib/store/toast-store";

function initialQuote() {
  const defaultMarkup = quoteTemplateStore.getSnapshot().branding.defaultMarkupMultiplier;
  return blankQuote(quotesStore.nextQuoteNumber(), defaultMarkup);
}

export default function CreateQuotePage() {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [clearOpen, setClearOpen] = useState(false);

  const patchQuote = (patch: Partial<typeof quote>) =>
    setQuote((q) => {
      const next = { ...q, ...patch };
      if (patch.shutterFinishId !== undefined && patch.shutterFinishId !== q.shutterFinishId) {
        next.units = applyShutterFinishToUnits(next.units, patch.shutterFinishId);
      }
      return next;
    });

  const handleSave = () => {
    quotesStore.saveQuote(quote);
    toastStore.show(`${quote.quoteNumber} saved`);
    router.push("/quotes");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-20 -mx-6 flex flex-col gap-3 border-b border-grey-100 bg-light px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/quotes" />}>Quotes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-semibold text-grey-900">Create New Quote</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setClearOpen(true)}>
              Clear Draft
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Quote
            </Button>
          </div>
        </div>
      </div>

      <ClientDetailsSection quote={quote} onChange={patchQuote} />
      <MaterialSpecificationSection quote={quote} onChange={patchQuote} />
      <UnitsSection units={quote.units} shutterFinishId={quote.shutterFinishId} onChange={(units) => patchQuote({ units })} />
      <PricingSummary quote={quote} onChange={patchQuote} />

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear this draft?"
        description="This discards every Client Detail, Material Specification, and Unit entered so far. This cannot be undone."
        confirmLabel="Clear Draft"
        onConfirm={() => setQuote(initialQuote())}
      />
    </div>
  );
}
