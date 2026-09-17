"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle } from "lucide-react";
import { FormInput, PasswordInput, FormCheckbox, PrimaryButton } from "@/components/shared/FormControls";
import { authCopy, COURSE_OPTIONS, STUDENT_DASHBOARD_ROUTE, ADMIN_DASHBOARD_ROUTE, FACULTY_DASHBOARD_ROUTE } from "./auth.data";
import type { RegisterFormValues } from "./auth.types";
import { useAuth } from "@/lib/auth-context";

const phoneRegex = /^[6-9]\d{9}$/;

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    mobileNumber: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
    parentMobileNumber: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
    courseInterested: z.string().min(1, "Please select a course"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
} as const;

/**
 * Registration form — calls real backend API.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: false },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    console.log("Registration submitted:", data);

    const result = await registerUser(data);

    setIsLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    // Role-based redirect (registration always creates STUDENT, but handle generically)
    if (result.user) {
      switch (result.user.role) {
        case "ADMIN":
          router.push(ADMIN_DASHBOARD_ROUTE);
          break;
        case "FACULTY":
          router.push(FACULTY_DASHBOARD_ROUTE);
          break;
        case "STUDENT":
        default:
          router.push(STUDENT_DASHBOARD_ROUTE);
          break;
      }
    } else {
      // Fallback if user not returned
      router.push(STUDENT_DASHBOARD_ROUTE);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <motion.div variants={fieldVariants} className="text-center mb-2">
        <h1 className="text-2xl font-bold mb-1.5">{authCopy.register.title}</h1>
        <p className="text-sm text-muted-foreground">{authCopy.register.subtitle}</p>
      </motion.div>

      {errorMessage && (
        <motion.div
          variants={fieldVariants}
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <motion.div variants={fieldVariants}>
        <FormInput
          id="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          autoComplete="name"
          required
          register={register("fullName")}
          error={errors.fullName?.message}
        />
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

      <motion.div variants={fieldVariants} className="grid sm:grid-cols-2 gap-4">
        <FormInput
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          placeholder="10-digit number"
          autoComplete="tel"
          required
          register={register("mobileNumber")}
          error={errors.mobileNumber?.message}
        />
        <FormInput
          id="parentMobileNumber"
          label="Parent Mobile Number"
          type="tel"
          placeholder="10-digit number"
          autoComplete="tel"
          required
          register={register("parentMobileNumber")}
          error={errors.parentMobileNumber?.message}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <label htmlFor="courseInterested" className="text-sm font-medium mb-1.5 block">
          Course Interested <span className="text-destructive">*</span>
        </label>
        <select
          id="courseInterested"
          defaultValue=""
          aria-invalid={!!errors.courseInterested}
          aria-describedby={errors.courseInterested ? "courseInterested-error" : undefined}
          {...register("courseInterested")}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="" disabled>
            Select a course
          </option>
          {COURSE_OPTIONS.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label}
            </option>
          ))}
        </select>
        {errors.courseInterested && (
          <p id="courseInterested-error" role="alert" className="text-xs text-destructive mt-1">
            {errors.courseInterested.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants}>
        <PasswordInput
          id="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          register={register("password")}
          error={errors.password?.message}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <FormCheckbox
          id="agreeToTerms"
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              &amp;{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </>
          }
          register={register("agreeToTerms")}
          error={errors.agreeToTerms?.message}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <PrimaryButton isLoading={isLoading} loadingLabel="Creating account...">
          <UserPlus className="h-4 w-4 mr-2" />
          Create Account
        </PrimaryButton>
      </motion.div>

      <motion.p variants={fieldVariants} className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </motion.p>
    </motion.form>
  );
}