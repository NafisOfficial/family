"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/forms/FormField";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const password = watch("password") ?? "";


  const onSubmit = async (data: RegisterInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          displayName: data.displayName,
        }),
      });


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const responseData = await res.json();
      const email = responseData.data.email;

      // Redirect to verify-email page with email as query parameter
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setSubmitError(errorMessage);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Let's make some memory"
      description="Fill in the details below to get started."
      quote="Every family has a story worth keeping."
      primaryImageSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
      primaryImageAlt="Family gathered together"
      secondaryImageSrc="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80"
      secondaryImageAlt="Parents holding a young child outdoors"
      secondaryCaption="Summer, every year"
      tertiaryImageSrc="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=500&q=80"
      tertiaryImageAlt="Children playing together in a garden"
      tertiaryCaption="Summer, every year"
    >
      {submitError ? (
        <div role="alert" className="auth-error mb-5">
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Full name"
          htmlFor="displayName"
          error={errors.displayName?.message}
        >
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9382]" />
            <input
              {...register("displayName")}
              id="displayName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              className="auth-input"
            />
          </div>
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
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

        <div>
          <PasswordInput
            id="password"
            label="Create a password"
            register={register("password")}
            error={errors.password?.message}
          />
        </div>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <div className="relative">
            <PasswordInput
              id="confirmPassword"
              register={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              showLabel={false}
              label={""}
            />
          </div>
        </FormField>

        <Button
          type="submit"
          className="auth-submit-button py-3 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <span className="text-[#EFEAD9]">Create account</span>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B6353]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#1F3D2B] transition hover:text-[#C08A3E]"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
