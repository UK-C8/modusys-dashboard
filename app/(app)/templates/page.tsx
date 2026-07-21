"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Construction } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { MaterialSpecSection } from "@/components/templates/material-spec-section";
import { PricingListSection } from "@/components/templates/pricing-list-section";

const topTabs = [
  { value: "pricing-list", label: "Pricing List" },
  { value: "unit-type", label: "Unit Type" },
  { value: "cabinet-type", label: "Cabinet Type" },
  { value: "quote-example", label: "Quote Example" },
  { value: "material-spec", label: "Material Spec" },
];

function TemplatesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "pricing-list";

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-grey-900">Templates</h1>
        <p className="text-sm font-body text-grey-400">Configure the building blocks quotes are built from</p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList className="flex-wrap">
          {topTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {topTabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="pt-6">
            {t.value === "material-spec" ? (
              <MaterialSpecSection />
            ) : t.value === "pricing-list" ? (
              <PricingListSection />
            ) : (
              <EmptyState icon={Construction} message={`${t.label} is coming in a later phase.`} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesPageContent />
    </Suspense>
  );
}
