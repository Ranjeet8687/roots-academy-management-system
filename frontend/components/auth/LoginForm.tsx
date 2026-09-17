"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";

import {
  FormInput,
  PasswordInput,
  FormCheckbox,
  PrimaryButton,
} from "@/components/shared/FormControls";

import {
  authCopy,
  STUDENT_DASHBOARD_ROUTE,
  ADMIN_DASHBOARD_ROUTE,
  FACULTY_DASHBOARD_ROUTE,
} from "./auth.data";
import { useAuth } from "@/lib/auth-context";

/* -------------------------------------------------------------------------- */
/* Login validation schema                                                    */
/* -------------------------------------------------------------------------- */

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  rememberMe: z.boolean().default(false),
});

/*
 * Input type = what React Hook Form receives from the form.
 * Output type = what Zod produces after validation.
 */
type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/* Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fieldVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
} as const;

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Login Form                                                                 */
/* -------------------------------------------------------------------------- */

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Submit handler                                                           */
  /* ------------------------------------------------------------------------ */

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormOutput) => {
    setIsLoading(true);
    setErrorMessage(null);

    console.log("Login submitted:", data);

    const result = await login(data.email, data.password);

    setIsLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    // Role-based redirect
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

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Heading                                                            */}
      {/* ------------------------------------------------------------------ */}

      <motion.div
        variants={fieldVariants}
        className="text-center mb-2"
      >
        <h1 className="text-2xl font-bold mb-1.5">
          {authCopy.login.title}
        </h1>

        <p className="text-sm text-muted-foreground">
          {authCopy.login.subtitle}
        </p>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Error Message                                                      */}
      {/* ------------------------------------------------------------------ */}

      {errorMessage && (
        <motion.div
          variants={fieldVariants}
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Email                                                              */}
      {/* ------------------------------------------------------------------ */}

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

      {/* ------------------------------------------------------------------ */}
      {/* Password                                                           */}
      {/* ------------------------------------------------------------------ */}

      <motion.div variants={fieldVariants}>
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          register={register("password")}
          error={errors.password?.message}
        />
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Remember Me + Forgot Password                                     */}
      {/* ------------------------------------------------------------------ */}

      <motion.div
        variants={fieldVariants}
        className="flex items-center justify-between"
      >
        <FormCheckbox
          id="rememberMe"
          label="Remember me"
          register={register("rememberMe")}
        />

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Login Button                                                       */}
      {/* ------------------------------------------------------------------ */}

      <motion.div variants={fieldVariants}>
        <PrimaryButton
          isLoading={isLoading}
          loadingLabel="Logging in..."
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </PrimaryButton>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Divider                                                            */}
      {/* ------------------------------------------------------------------ */}

      <motion.div
        variants={fieldVariants}
        className="flex items-center gap-3 py-1"
      >
        <span className="flex-1 h-px bg-border" />

        <span className="text-xs text-muted-foreground">
          OR
        </span>

        <span className="flex-1 h-px bg-border" />
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Register Link                                                      */}
      {/* ------------------------------------------------------------------ */}

      <motion.p
        variants={fieldVariants}
        className="text-center text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}

        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create Account
        </Link>
      </motion.p>
    </motion.form>
  );
}