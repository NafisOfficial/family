"use client";

import { FormField } from "@/components/forms/FormField";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  helpText?: string;
  showLabel?: boolean;
}

export function PasswordInput({
  id,
  label,
  register,
  error,
  helpText,
  className,
  showLabel = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputElement = (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9382]" />
      <input
        {...register}
        id={id}
        type={showPassword ? "text" : "password"}
        className={cn("auth-input", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#6B6353] transition hover:bg-[#EFEAD9] hover:text-[#1F3D2B] focus:outline-none focus:ring-2 focus:ring-[#C08A3E]/40"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  if (!showLabel) {
    return inputElement;
  }

  return (
    <FormField
      label={label}
      htmlFor={id}
      helpText={helpText}
      error={error}
      className={className}
    >
      {inputElement}
    </FormField>
  );
}
