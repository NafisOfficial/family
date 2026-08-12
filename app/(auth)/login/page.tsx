"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/forms/FormField";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null);

    try {
      await login(data.email, data.password);
      router.push("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.";
      setSubmitError(errorMessage);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back to the tree"
      quote="A family story told once is a memory. Told again, it becomes a heritage."
      primaryImageSrc="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80"
      primaryImageAlt="Family gathered together"
      secondaryImageSrc="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=500&q=80"
      secondaryImageAlt="Three generations of a family laughing together"
      secondaryCaption="Nan & Pop, 1971"
      tertiaryImageSrc="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=500&q=80"
      tertiaryImageAlt="Grandparents sitting together on a porch"
      tertiaryCaption="Nan & Pop, 1971"
    >
      {submitError ? (
        <div role="alert" className="auth-error mb-4">
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Email address"
          htmlFor="email"
          error={errors.email?.message}
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9382]" />
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
        </FormField>

        <PasswordInput
          id="password"
          label="Password"
          register={register("password")}
          error={errors.password?.message}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
          <p className="text-sm text-[#6B6353]">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#1F3D2B] hover:text-[#C08A3E]"
            >
              Create account
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="auth-submit-button"
            disabled={isSubmitting || isDemoLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="auth-submit-button"
            disabled={isSubmitting || isDemoLoading}
            onClick={async () => {
              setSubmitError(null);
              setIsDemoLoading(true);
              try {
                await login("demo@familytree.com", "DemoPassword123");
                router.push("/feed");
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Unable to sign in to demo account.";
                setSubmitError(errorMessage);
              } finally {
                setIsDemoLoading(false);
              }
            }}
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading demo...
              </>
            ) : (
              "Use demo account"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
