import { Building2, Wallet, Users, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatInr } from "@/lib/format";

export function OrgDetailsCard({
  name,
  type,
  creditsBalance,
  totalMembers,
}: {
  name: string;
  type: string;
  creditsBalance: number;
  totalMembers: number;
}) {
  const stats = [
    { label: "Org Name", value: name, icon: Building2 },
    { label: "Type", value: type, icon: Tag },
    { label: "Credits Balance", value: formatInr(creditsBalance), icon: Wallet },
    { label: "Total Members", value: String(totalMembers), icon: Users },
  ];

  return (
    <Card className="border-grey-100">
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-transparent p-2 text-primary">
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-body text-grey-400">{stat.label}</span>
              <span className="truncate font-heading text-base font-semibold text-grey-900">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
