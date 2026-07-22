"use client";

import type { QuoteTemplateSettings } from "@/lib/mock/quote-template";

const SAMPLE_UNITS = [
  { name: "Base Unit — U1", cost: 42500 },
  { name: "Wall Unit — U2", cost: 28900 },
  { name: "Tall Unit — U3", cost: 61200 },
];

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

// The rendered mock of the client-facing Quote PDF, driven by sample line
// items + whatever Quote Template settings are live — shared by the full
// Preview modal and the docked sidebar preview so both stay identical.
export function QuotePdfSheet({ settings }: { settings: QuoteTemplateSettings }) {
  const { layout, branding, banking, signature, notes, terms, paymentTerms } = settings;

  const total = SAMPLE_UNITS.reduce((sum, u) => sum + u.cost, 0);
  const discount = Math.round(total * 0.08);
  const afterDiscount = total - discount;
  const finalOffer = afterDiscount;

  return (
    <div className="w-full max-w-[600px] rounded-sm border border-grey-100 bg-white p-6 font-body text-[13px] text-grey-800 shadow-sm sm:p-10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-grey-800 pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-lg font-bold text-grey-900">{branding.companyName}</span>
          <span className="text-xs text-grey-500">{branding.tagline}</span>
          <span className="text-xs text-grey-500">{branding.address}</span>
          <span className="text-xs text-grey-500">
            Email - {branding.email} | Mob: {branding.phone}
          </span>
        </div>
        {branding.logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logoDataUrl} alt="" className="h-12 w-24 object-contain" />
        )}
      </div>

      {/* Client */}
      <div className="mt-4 flex flex-col gap-0.5 text-xs text-grey-600">
        <span className="font-medium text-grey-800">Client: Sample Customer</span>
        <span>Quote No: Q-SAMPLE-001 · Date: {new Date().toLocaleDateString("en-IN")}</span>
      </div>

      {/* Pricing table */}
      <table className="mt-5 w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-grey-300 text-left text-grey-500">
            <th className="py-1.5 font-medium">Unit</th>
            {layout.showUnitLevelPricing && <th className="py-1.5 text-right font-medium">Amount</th>}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_UNITS.map((u) => (
            <tr key={u.name} className="border-b border-grey-100">
              <td className="py-1.5">{u.name}</td>
              {layout.showUnitLevelPricing && <td className="py-1.5 text-right">{formatInr(u.cost)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Waterfall */}
      <div className="mt-4 flex flex-col gap-1 border-t border-grey-300 pt-3 text-xs">
        <div className="flex justify-between"><span>Total</span><span>{formatInr(total)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-{formatInr(discount)}</span></div>
        <div className="flex justify-between"><span>Amount After Discount</span><span>{formatInr(afterDiscount)}</span></div>
        <div className="flex justify-between">
          <span>INSTALLATION & FREIGHT {layout.installationFreightText.toUpperCase()}</span>
          <span>—</span>
        </div>
        <div className="flex justify-between border-t border-grey-300 pt-1 font-semibold text-grey-900">
          <span>Final Offer</span>
          <span>{formatInr(finalOffer)}</span>
        </div>
      </div>

      {/* Notes */}
      {notes.length > 0 && (
        <div className="mt-5 text-[11px] text-grey-500">
          <span className="font-medium text-grey-700">NOTE:</span>
          <ol className="mt-1 list-decimal pl-4">
            {notes.map((n) => <li key={n.id}>{n.text}</li>)}
          </ol>
        </div>
      )}

      {/* Terms */}
      {terms.length > 0 && (
        <div className="mt-4 text-[11px] text-grey-500">
          <span className="font-medium text-grey-700">TERMS & CONDITIONS:</span>
          <ol className="mt-1 list-decimal pl-4">
            {terms.map((t) => <li key={t.id}>{t.text}</li>)}
          </ol>
        </div>
      )}

      {paymentTerms.length > 0 && (
        <div className="mt-4 text-[11px] text-grey-500">
          <span className="font-medium text-grey-700">PAYMENT TERMS:</span>
          <ol className="mt-1 list-decimal pl-4">
            {paymentTerms.map((t) => <li key={t.id}>{t.text}</li>)}
          </ol>
        </div>
      )}

      {/* Bank details + validity */}
      <div className="mt-4 text-[11px] text-grey-500">
        BANK DETAILS: {banking.bankName} ({banking.branch}) | {banking.accountName} | CURRENT A/C No:{" "}
        {banking.accountNumber} | IFSC code: {banking.ifscCode}
      </div>
      <div className="mt-1 text-[11px] text-grey-500">
        Cheque or RTGS/NEFT should be in favour of &apos;{layout.chequePayableTo}&apos;.
      </div>
      <div className="mt-1 text-[11px] text-grey-500">{layout.quoteValidityText}</div>

      {/* Signature */}
      <div className="mt-8 flex flex-col items-end gap-6 text-right text-xs">
        <div className="flex flex-col items-end gap-0.5">
          <span>For, {signature.companyName}</span>
          {signature.additionalFooterText && (
            <span className="max-w-xs text-[11px] text-grey-400">{signature.additionalFooterText}</span>
          )}
        </div>
        <span className="font-medium">{signature.signatureTitle}</span>
      </div>
    </div>
  );
}
