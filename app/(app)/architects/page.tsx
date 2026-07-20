import { ArchitectsTable } from "@/components/architects/architects-table";

export default function ArchitectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-grey-900">Architects</h1>
        <p className="text-sm font-body text-grey-500">Manage architect contacts and referred business.</p>
      </div>
      <ArchitectsTable />
    </div>
  );
}
