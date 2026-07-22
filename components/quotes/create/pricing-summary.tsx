"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFurniturePriceItems, useHardwarePriceItems } from "@/lib/store/pricing-list-store";
import { quoteRawTotal, quoteWaterfall } from "@/lib/quote-pricing";
import type { Quote } from "@/lib/mock/quote";

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function PricingSummary({ quote, onChange }: { quote: Quote; onChange: (patch: Partial<Quote>) => void }) {
  const furnitureItems = useFurniturePriceItems();
  const hardwareItems = useHardwarePriceItems();

  const rawTotal = quoteRawTotal(quote.units, furnitureItems, hardwareItems);
  const waterfall = quoteWaterfall(rawTotal, quote.markupMultiplier, quote.specialDiscountPct, quote.installationFreightIncluded);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-grey-100 bg-card p-6">
      <h2 className="font-heading text-lg font-semibold text-grey-900">Pricing Summary</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="q-discount">Special Discount %</Label>
          <Input
            id="q-discount"
            type="number"
            min={0}
            max={100}
            value={quote.specialDiscountPct || ""}
            onChange={(e) => onChange({ specialDiscountPct: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="q-freight"
            type="checkbox"
            checked={quote.installationFreightIncluded}
            onChange={(e) => onChange({ installationFreightIncluded: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          <Label htmlFor="q-freight">Installation & Freight Included</Label>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-light-600 p-4 text-sm font-body">
        <div className="flex justify-between text-grey-600">
          <span>Total (raw cost × markup)</span>
          <span>{formatInr(waterfall.total)}</span>
        </div>
        <div className="flex justify-between text-grey-600">
          <span>Special Discount ({quote.specialDiscountPct || 0}%)</span>
          <span>-{formatInr(waterfall.discount)}</span>
        </div>
        <div className="flex justify-between text-grey-600">
          <span>Amount After Discount</span>
          <span>{formatInr(waterfall.afterDiscount)}</span>
        </div>
        <div className="flex justify-between text-grey-600">
          <span>Installation & Freight</span>
          <span>{quote.installationFreightIncluded ? "Included" : "—"}</span>
        </div>
        <div className="flex justify-between text-grey-600">
          <span>Round Off</span>
          <span>{formatInr(waterfall.roundOff)}</span>
        </div>
        <div className="flex justify-between border-t border-grey-200 pt-2 font-semibold text-grey-900">
          <span>Final Offer Amount</span>
          <span>{formatInr(waterfall.finalOffer)}</span>
        </div>
      </div>
    </section>
  );
}
