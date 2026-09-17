"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { GALLERY_LABEL, GALLERY_HEADING, GALLERY_DESCRIPTION } from "./gallery.data";
import type { GalleryHeaderProps } from "./gallery.types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/**
 * GalleryHeader
 * Centered section intro: small label, heading, supporting
 * paragraph. Copy sourced from gallery.data.ts so it can be
 * swapped or localized without touching this component.
 */
export function GalleryHeader({ className }: GalleryHeaderProps) {
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
        {GALLERY_LABEL}
      </motion.span>

      <motion.h2
        variants={fadeUp}
        className="text-[30px] leading-[38px] font-bold tracking-[-0.01em] sm:text-[36px] sm:leading-[44px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {GALLERY_HEADING}
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="text-[16px] leading-[26px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {GALLERY_DESCRIPTION}
      </motion.p>
    </motion.div>
  );
}