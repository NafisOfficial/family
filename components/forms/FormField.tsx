import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  helpText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  helpText,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-[#1F3D2B]"
      >
        {label}
      </label>

      {children}

      {helpText ? (
        <p className="text-sm leading-6 text-[#6B6353]">{helpText}</p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
