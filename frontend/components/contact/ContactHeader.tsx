"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTACT_LABEL, CONTACT_HEADING, CONTACT_DESCRIPTION } from "./contact.data";
import type { ContactHeaderProps } from "./contact.types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/**
 * ContactHeader
 * Centered section intro: small label, heading, supporting
 * paragraph. Copy sourced from contact.data.ts so it can be
 * swapped or localized without touching this component.
 */
export function ContactHeader({ className }: ContactHeaderProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={cn("mx-auto flex max-w-2xl flex-col items-center gap-4 text-center", className)}
    >
      <motion.span
        variants={fadeUp}
        className="text-[13px] font-semibold uppercase tracking-[0.04em]"
        style={{ color: "var(--color-primary)" }}
      >
        {CONTACT_LABEL}
      </motion.span>

      <motion.h2
        variants={fadeUp}
        className="text-[30px] leading-[38px] font-bold tracking-[-0.01em] sm:text-[36px] sm:leading-[44px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {CONTACT_HEADING}
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="text-[16px] leading-[26px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {CONTACT_DESCRIPTION}
      </motion.p>
    </motion.div>
  );
}