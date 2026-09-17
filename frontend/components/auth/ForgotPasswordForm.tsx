"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { FormInput, PrimaryButton } from "@/components/shared/FormControls";
import { authCopy, AUTH_SIMULATED_DELAY_MS } from "./auth.data";
import type { ForgotPasswordFormValues } from "./auth.types";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

/**
 * Forgot Password form — fully frontend-only. Simulates a delay, then
 * swaps the form for a success confirmation in place (no redirect).
 */
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    console.log("Forgot password submitted:", data);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, AUTH_SIMULATED_DELAY_MS);
  };

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center py-4"
        >
          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">{authCopy.forgotPassword.successTitle}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {authCopy.forgotPassword.successSubtitle}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <motion.div variants={fieldVariants} className="text-center mb-2">
            <h1 className="text-2xl font-bold mb-1.5">{authCopy.forgotPassword.title}</h1>
            <p className="text-sm text-muted-foreground">{authCopy.forgotPassword.subtitle}</p>
          </motion.div>

          <motion.div variants={fieldVariants}>
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              register={register("email")}
              error={errors.email?.message}
            />
          </motion.div>

          <motion.div variants={fieldVariants}>
            <PrimaryButton isLoading={isLoading} loadingLabel="Sending link...">
              <Send className="h-4 w-4 mr-2" />
              Send Reset Link
            </PrimaryButton>
          </motion.div>

          <motion.p variants={fieldVariants} className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </motion.p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}