"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { withPasswordFields } from "@/lib/password-schema";
import { usersStore } from "@/lib/store/users-store";
import { CURRENT_USER_ID } from "@/lib/session";
import type { z } from "zod";

const changePasswordSchema = withPasswordFields({});
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async () => {
    // No current-password re-entry needed — already authenticated at this
    // point, per spec (the admin-set temporary password got them this far).
    usersStore.clearMustChangePassword(CURRENT_USER_ID);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-grey-900">Set a new password</h1>
        <p className="text-sm font-body text-grey-400">
          Your admin set a temporary password — choose a new one to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <IconInput
            icon={Lock}
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register("password")}
          />
          <PasswordRequirements value={watch("password")} />
        </div>

        <IconInput
          icon={Lock}
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" disabled={isSubmitting || !isValid} className="mt-1 w-full font-body font-semibold">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save and Continue"
          )}
        </Button>
      </form>
    </div>
  );
}
