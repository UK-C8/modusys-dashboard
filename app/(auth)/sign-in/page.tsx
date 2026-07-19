"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/auth/icon-input";
import { mockSignIn } from "@/lib/auth/mock";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: SignInValues) => {
    const success = await mockSignIn(values.email, values.password);
    if (!success) {
      setError("password", { message: "Incorrect email or password" });
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-grey-900">Welcome back</h1>
        <p className="text-sm font-body text-grey-400">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <IconInput
          icon={Mail}
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />
        <IconInput
          icon={Lock}
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full font-body font-semibold">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <a href="#" className="text-center text-sm font-body text-secondary hover:underline">
          Forgot your password?
        </a>
      </form>
    </div>
  );
}
