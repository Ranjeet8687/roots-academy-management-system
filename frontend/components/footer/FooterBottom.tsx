"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FooterBottomProps } from "./footer.types";

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
 * FooterBottom
 * Copyright notice and bottom-row legal links.
 */
export function FooterBottom({
  copyright,
  bottomLinks,
  className,
}: FooterBottomProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "flex flex-col items-center gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-between",
        className
      )}
    >
      <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">
        {copyright}
      </p>

      <nav aria-label="Legal links">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {bottomLinks.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className="rounded-[var(--radius-sm)] text-[var(--text-caption)] text-[var(--color-text-muted)] transition-colors duration-[var(--transition-base)] hover:text-[var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}