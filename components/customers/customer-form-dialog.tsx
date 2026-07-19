"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
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
import { months } from "@/lib/constants/months";
import { mockUsers } from "@/lib/mock/users";
import type { Customer } from "@/lib/mock/pipeline";
import type { CustomerProfile } from "@/lib/mock/customer-detail";
import type { ProfileOverride } from "@/lib/store/customer-profile-overrides-store";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z
    .string()
    .refine((v) => v === "" || /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, "")), {
      message: "Enter a valid 10-digit Indian mobile number",
    }),
  email: z.string().refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address",
  }),
  gst: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string().refine((v) => v === "" || /^\d+$/.test(v), {
    message: "Postcode must be numeric",
  }),
  birthdayMonth: z.string(),
  birthdayDay: z.string(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

function emptyValues(): CustomerFormValues {
  return {
    name: "",
    mobile: "",
    email: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    birthdayMonth: "",
    birthdayDay: "",
  };
}

function prefillValues(customer: Customer, profile: CustomerProfile, override: ProfileOverride): CustomerFormValues {
  const merged = { ...profile, ...override };
  return {
    name: override.name ?? customer.name,
    mobile: merged.phone,
    email: merged.email,
    gst: merged.gst,
    address: merged.area,
    city: merged.city,
    state: merged.state,
    postcode: merged.postcode,
    birthdayMonth: merged.birthdayMonth,
    birthdayDay: merged.birthdayDay,
  };
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  profile,
  override,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Absent = Add mode; present = Edit mode, pre-filled from this record.
  customer?: Customer;
  profile?: CustomerProfile;
  override?: ProfileOverride;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const isEdit = !!customer;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    reset(customer && profile ? prefillValues(customer, profile, override ?? {}) : emptyValues());
  }, [open, customer, profile, override, reset]);

  const submit = (values: CustomerFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const updatedBy = override?.updatedById ? mockUsers.find((u) => u.id === override.updatedById)?.name : undefined;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(emptyValues()); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this customer's details." : "Add a new customer to the pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-name">Name *</Label>
            <Input id="c-name" placeholder="e.g. Desai Apartment" {...register("name")} />
            {errors.name && <span className="text-xs font-body text-error">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-mobile">Mobile Number</Label>
              <Input id="c-mobile" placeholder="+91 98765 43210" {...register("mobile")} />
              {errors.mobile && <span className="text-xs font-body text-error">{errors.mobile.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" placeholder="name@email.com" {...register("email")} />
              {errors.email && <span className="text-xs font-body text-error">{errors.email.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-gst">GST No</Label>
            <Input id="c-gst" placeholder="22AAAAA0000A1Z5" {...register("gst")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-address">Address</Label>
            <Input id="c-address" placeholder="Street, area" {...register("address")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-city">City</Label>
              <Input id="c-city" {...register("city")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-state">State</Label>
              <Input id="c-state" {...register("state")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-postcode">Postcode</Label>
              <Input id="c-postcode" {...register("postcode")} />
              {errors.postcode && (
                <span className="text-xs font-body text-error">{errors.postcode.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-bday-month">Birthday Month</Label>
              <select
                id="c-bday-month"
                {...register("birthdayMonth")}
                defaultValue=""
                className="w-full rounded-lg border border-grey-100 bg-card px-3 py-2 text-sm font-body text-grey-900 outline-none focus:border-primary"
              >
                <option value="">Select month</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-bday-day">Birthday Day</Label>
              <Input id="c-bday-day" type="number" min={1} max={31} {...register("birthdayDay")} />
            </div>
          </div>

          {isEdit ? (
            override?.updatedAt && (
              <p className="text-xs font-body text-grey-400">
                Last updated{" "}
                {new Date(override.updatedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {updatedBy && ` by ${updatedBy}`}
              </p>
            )
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-info-transparent px-3 py-2 text-sm font-body text-info">
              <Info className="h-4 w-4 shrink-0" />
              10 credits will be charged for adding this customer.
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isEdit ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
