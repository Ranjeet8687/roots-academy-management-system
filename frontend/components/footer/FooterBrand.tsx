"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FooterBrandProps } from "./footer.types";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * FooterBrand
 * Institute name, tagline, and description.
 */
export function FooterBrand({ brand, className }: FooterBrandProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn("flex max-w-sm flex-col gap-3", className)}
    >
      <span className="text-[var(--text-subheading)] font-[var(--font-weight-bold)] uppercase tracking-wide text-[var(--color-text-primary)]">
        {brand.name}
      </span>

      <span className="text-[var(--text-caption)] font-[var(--font-weight-semibold)] uppercase tracking-wide text-[var(--color-primary)]">
        {brand.tagline}
      </span>

      <p className="text-[var(--text-body)] leading-[var(--leading-body)] text-[var(--color-text-secondary)]">
        {brand.description}
      </p>
    </motion.div>
  );
}