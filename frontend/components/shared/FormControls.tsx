"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormInputProps, FormCheckboxProps } from "@/components/auth/auth.types";

/**
 * Reusable labeled text input with inline validation. Generic enough
 * to be used anywhere a React Hook Form `register` return value is
 * available, not just inside the auth module.
 */
export function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  register,
  error,
  required,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium mb-1.5 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          error ? "border-destructive" : "border-border"
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Password variant of FormInput with a show/hide toggle. Kept as its
 * own component (rather than a branch inside FormInput) since it owns
 * dedicated visibility state and an icon button.
 */
export function PasswordInput({
  id,
  label,
  placeholder,
  autoComplete = "current-password",
  register,
  error,
  required,
}: FormInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium mb-1.5 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register}
          className={cn(
            "w-full px-4 py-2.5 pr-11 rounded-lg border bg-background text-sm transition-shadow",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            error ? "border-destructive" : "border-border"
          )}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

/** Reusable labeled checkbox with inline validation message. */
export function FormCheckbox({ id, label, register, error }: FormCheckboxProps) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
        />
        <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer select-none">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

type PrimaryButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingLabel?: string;
};

/**
 * Standard full-width submit button with a built-in loading spinner
 * state, so LoginForm / RegisterForm / ForgotPasswordForm don't each
 * reimplement the same isLoading → spinner branch.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ isLoading, loadingLabel = "Please wait...", children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        size="lg"
        disabled={disabled || isLoading}
        className={cn("w-full", className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";