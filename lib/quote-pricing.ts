import type { FurnitureLineItem, UnitTypeHardware } from "@/lib/mock/unit-type";
import type { FurniturePriceItem, HardwarePriceItem } from "@/lib/mock/pricing-list";
import { rateAfterDiscount } from "@/lib/mock/pricing-list";
import type { QuoteCabinet, QuoteUnit } from "@/lib/mock/quote";

export const SQMM_PER_SQFT = 92_903.04;

// Formulas only ever reference W/D/H plus +-*/() and numbers (see
// furniture-line-item-row.tsx placeholders: "(W-95)/2", "H-20") — never
// arbitrary code, so a whitelist-filtered `Function` eval is safe.
export function evaluateFormula(formula: string, vars: { W: number; D: number; H: number }): number {
  const trimmed = formula.trim();
  if (!trimmed) return 0;
  if (!/^[\d\s+\-*/().WDH]+$/.test(trimmed)) return 0;
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("W", "D", "H", `return (${trimmed});`);
    const result = fn(vars.W, vars.D, vars.H);
    return typeof result === "number" && Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export function findFurnitureMatch(item: FurnitureLineItem, furnitureItems: FurniturePriceItem[]): FurniturePriceItem | null {
  if (!item.thicknessId || !item.rawMaterialTypeId || !item.internalColourId || !item.externalColourId) return null;
  return (
    furnitureItems.find(
      (i) =>
        i.thicknessId === item.thicknessId &&
        i.rawMaterialTypeId === item.rawMaterialTypeId &&
        i.internalColourId === item.internalColourId &&
        i.externalColourId === item.externalColourId
    ) ?? null
  );
}

export function furnitureLineTotal(
  item: FurnitureLineItem,
  unit: { width: number; depth: number; height: number },
  furnitureItems: FurniturePriceItem[]
): number {
  const match = findFurnitureMatch(item, furnitureItems);
  if (!match) return 0;
  const w = evaluateFormula(item.widthFormula, { W: unit.width, D: unit.depth, H: unit.height });
  const h = evaluateFormula(item.heightFormula, { W: unit.width, D: unit.depth, H: unit.height });
  const areaSqFt = (w * h) / SQMM_PER_SQFT;
  return match.rate * areaSqFt * item.qty;
}

export function hardwareLineTotal(
  item: UnitTypeHardware,
  unit: { width: number; depth: number; height: number },
  hardwareItems: HardwarePriceItem[]
): number {
  const matched = hardwareItems.find((h) => h.id === item.hardwareItemId);
  if (!matched) return 0;
  const qty = evaluateFormula(item.qtyFormula, { W: unit.width, D: unit.depth, H: unit.height });
  return rateAfterDiscount(matched) * qty;
}

export function groupTotal(
  items: FurnitureLineItem[],
  unit: { width: number; depth: number; height: number },
  furnitureItems: FurniturePriceItem[]
): number {
  return items.reduce((sum, i) => sum + furnitureLineTotal(i, unit, furnitureItems), 0);
}

export function cabinetTotal(
  cabinet: QuoteCabinet,
  unit: { width: number; depth: number; height: number },
  furnitureItems: FurniturePriceItem[],
  hardwareItems: HardwarePriceItem[]
): number {
  return (
    groupTotal(cabinet.components, unit, furnitureItems) +
    groupTotal(cabinet.externalFinishes, unit, furnitureItems) +
    groupTotal(cabinet.panels, unit, furnitureItems) +
    cabinet.hardware.reduce((sum, h) => sum + hardwareLineTotal(h, unit, hardwareItems), 0)
  );
}

export function unitTotal(
  unit: QuoteUnit,
  furnitureItems: FurniturePriceItem[],
  hardwareItems: HardwarePriceItem[]
): number {
  const perCabinet = unit.cabinets.reduce((sum, c) => sum + cabinetTotal(c, unit, furnitureItems, hardwareItems), 0);
  return perCabinet * unit.qty;
}

export function quoteRawTotal(
  units: QuoteUnit[],
  furnitureItems: FurniturePriceItem[],
  hardwareItems: HardwarePriceItem[]
): number {
  return units.reduce((sum, u) => sum + unitTotal(u, furnitureItems, hardwareItems), 0);
}

// Markup applies to raw cost first, Special Discount applies on the marked-up
// figure — confirmed against business logic before building (not the other
// order).
export function quoteWaterfall(
  rawTotal: number,
  markupMultiplier: number,
  specialDiscountPct: number,
  installationFreightIncluded: boolean
) {
  const markedUp = rawTotal * markupMultiplier;
  const discount = markedUp * (specialDiscountPct / 100);
  const afterDiscount = markedUp - discount;
  const roundOff = Math.round(afterDiscount) - afterDiscount;
  const finalOffer = Math.round(afterDiscount);
  return {
    total: markedUp,
    discount,
    afterDiscount,
    installationFreight: installationFreightIncluded ? 0 : 0,
    roundOff,
    finalOffer,
  };
}
