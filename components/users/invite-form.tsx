"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleSelectField } from "@/components/users/role-select-field";
import { usersStore } from "@/lib/store/users-store";
import { roleKeys } from "@/lib/constants/roles";

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  role: z.enum(roleKeys, { message: "Select a role" }),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function InviteForm({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema) });

  const role = watch("role");

  const onSubmit = async (values: InviteValues) => {
    usersStore.inviteUser(values);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" placeholder="Full name" {...register("name")} />
        {errors.name && <span className="text-xs font-body text-error">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <span className="text-xs font-body text-error">{errors.email.message}</span>}
      </div>

      <RoleSelectField
        id="invite-role"
        value={role ?? ""}
        registerProps={register("role")}
        error={errors.role?.message}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Send Invite
      </Button>
    </form>
  );
}
