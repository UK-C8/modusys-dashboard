"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChipInput } from "@/components/templates/chip-input";
import { pricingListStore } from "@/lib/store/pricing-list-store";
import { hardwareCategories, hardwareBrands, hardwareUnits, rateAfterDiscount, type HardwarePriceItem, type HardwareUnit } from "@/lib/mock/pricing-list";

type FormValues = {
  articleNo: string;
  categories: string[];
  brand: string;
  unit: HardwareUnit;
  description: string;
  mrp: number;
  discountPct: number;
};

function emptyValues(): FormValues {
  return { articleNo: "", categories: [], brand: "", unit: "Pcs", description: "", mrp: 0, discountPct: 0 };
}

export function HardwarePriceFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Absent = Add mode; present = Edit mode, pre-filled.
  item?: HardwarePriceItem;
  onSubmit: (values: FormValues) => void;
}) {
  const isEdit = !!item;
  const [values, setValues] = useState<FormValues>(emptyValues());
  const [articleNoError, setArticleNoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      item
        ? { articleNo: item.articleNo, categories: item.categories, brand: item.brand, unit: item.unit, description: item.description, mrp: item.mrp, discountPct: item.discountPct }
        : emptyValues()
    );
    setArticleNoError(null);
  }, [open, item]);

  const complete = values.articleNo.trim().length > 0 && values.brand.trim().length > 0 && values.mrp > 0;

  const submit = () => {
    if (pricingListStore.isArticleNoTaken(values.articleNo, item?.id)) {
      setArticleNoError("Article No. already exists — must be unique.");
      return;
    }
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Hardware Price" : "Add Hardware Price"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this hardware pricing entry." : "Add a new hardware catalog entry."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hp-article">Article No. *</Label>
            <Input
              id="hp-article"
              value={values.articleNo}
              onChange={(e) => {
                setValues((v) => ({ ...v, articleNo: e.target.value }));
                setArticleNoError(null);
              }}
            />
            {articleNoError && <span className="text-xs font-body text-error">{articleNoError}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <ChipInput
              values={values.categories}
              onChange={(categories) => setValues((v) => ({ ...v, categories }))}
              options={hardwareCategories}
              placeholder="Add category"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hp-brand">Brand *</Label>
              <Input
                id="hp-brand"
                list="hardware-brand-options"
                value={values.brand}
                onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
              />
              <datalist id="hardware-brand-options">
                {hardwareBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hp-unit">Unit</Label>
              <select
                id="hp-unit"
                value={values.unit}
                onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value as HardwareUnit }))}
                className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
              >
                {hardwareUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hp-description">Product Description</Label>
            <textarea
              id="hp-description"
              rows={3}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full resize-none rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hp-mrp">MRP (₹) *</Label>
              <Input
                id="hp-mrp"
                type="number"
                min={0}
                value={values.mrp || ""}
                onChange={(e) => setValues((v) => ({ ...v, mrp: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hp-discount">Discount %</Label>
              <div className="relative">
                <Input
                  id="hp-discount"
                  type="number"
                  min={0}
                  max={100}
                  value={values.discountPct || ""}
                  onChange={(e) => setValues((v) => ({ ...v, discountPct: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                  className="pr-7"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-body text-grey-400">%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rate After Discount</Label>
            <div className="rounded-lg border border-grey-100 bg-light-600 px-3 py-2 text-sm font-body font-semibold text-grey-700">
              ₹{rateAfterDiscount(values).toFixed(2)}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!complete} onClick={submit}>
              {isEdit ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
