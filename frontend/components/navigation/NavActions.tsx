"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_CTA } from "./navigation.data";
import type { NavActionsProps } from "./navigation.types";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

/**
 * NavActions
 * Right-side navbar actions. Shows login/register when not authenticated,
 * user menu when authenticated.
 */
export function NavActions({
  ctaLabel = NAV_CTA.label,
  ctaHref = NAV_CTA.href,
  className,
}: NavActionsProps) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="h-10 w-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Link
          href="/login"
          className={cn(
            "inline-flex items-center gap-2",
            "rounded-[var(--radius-md)] px-5 py-2.5",
            "font-semibold text-[var(--color-text-primary)]",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
            "hover:text-[var(--color-primary)]",
            "transition-colors duration-200"
          )}
        >
          Login
        </Link>
        <motion.div whileHover="hover" initial="rest" animate="rest">
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center gap-2",
              "rounded-[var(--radius-md)] px-5 py-2.5",
              "text-[var(--text-button)] font-semibold text-white",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            )}
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)",
              boxShadow: "var(--shadow-button)",
              transition: "all var(--transition-smooth)",
            }}
          >
            {ctaLabel}
            <motion.span
              className="inline-flex"
              variants={{ rest: { x: 0 }, hover: { x: 3 } }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Authenticated user menu
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-text-primary)] hidden sm:block">
          {user?.email}
        </span>
        <div className="relative">
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2",
              "font-medium text-[var(--color-text-primary)]",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
              "hover:bg-[var(--color-surface)]",
              "transition-colors duration-200"
            )}
            aria-expanded="false"
            aria-haspopup="true"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2",
            "font-medium text-destructive",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-destructive focus-visible:ring-offset-2",
            "hover:bg-destructive/10",
            "transition-colors duration-200"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}