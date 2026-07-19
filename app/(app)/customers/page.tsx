import { CustomersTable } from "@/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-grey-900">Customers</h1>
        <p className="text-sm font-body text-grey-500">Manage your customer records.</p>
      </div>
      <CustomersTable />
    </div>
  );
}
