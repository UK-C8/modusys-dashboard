"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SimpleCsvPanel } from "@/components/templates/simple-csv-panel";
import { FurniturePriceTable } from "@/components/templates/furniture-price-table";
import { HardwarePriceTable } from "@/components/templates/hardware-price-table";

export function PricingListSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subTab = searchParams.get("view") ?? "furniture";

  const setSubTab = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-grey-900">Pricing List</h1>
        <p className="text-sm font-body text-grey-400">Furniture and hardware rates used across quotes</p>
      </div>

      <Tabs value={subTab} onValueChange={(value) => setSubTab(String(value))}>
        <TabsList>
          <TabsTrigger value="furniture">Furniture Price List</TabsTrigger>
          <TabsTrigger value="hardware">Hardware Price List</TabsTrigger>
        </TabsList>

        <TabsContent value="furniture" className="flex flex-col gap-6 pt-6">
          <SimpleCsvPanel label="Furniture Price List" />
          <FurniturePriceTable />
        </TabsContent>

        <TabsContent value="hardware" className="flex flex-col gap-6 pt-6">
          <SimpleCsvPanel label="Hardware Price List" />
          <HardwarePriceTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
