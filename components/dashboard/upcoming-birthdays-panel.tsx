import { Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import type { Birthday } from "@/lib/mock/dashboard";

export function UpcomingBirthdaysPanel({ birthdays }: { birthdays: Birthday[] }) {
  return (
    <Card className="border-grey-100">
      <CardHeader>
        <CardTitle className="font-heading text-base text-grey-900">Upcoming Birthdays</CardTitle>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <EmptyState
            icon={Cake}
            message="No birthdays coming up in this range."
            cta={{ label: "Add a birthday", onClick: () => {} }}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-grey-100">
            {birthdays.map((person) => (
              <li key={person.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-pink-transparent text-pink text-sm">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-body text-grey-800">{person.name}</span>
                  <span className="text-xs font-body text-grey-400">{person.role}</span>
                </div>
                <span className="text-xs font-body font-medium text-grey-500">{person.date}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
