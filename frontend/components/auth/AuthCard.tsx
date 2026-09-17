"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

/**
 * The elevated white card hosting every auth form. Standalone (rather
 * than inlined into AuthLayout) so it can be reused outside the split
 * illustration layout later — e.g. a modal-based quick login.
 */
export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-8"
    >
      {children}
    </motion.div>
  );
}