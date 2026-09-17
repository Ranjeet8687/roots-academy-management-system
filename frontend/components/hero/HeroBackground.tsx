"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeroBackgroundProps } from "./hero.types";

/**
 * HeroBackground
 * Soft, slow-moving gradient blobs behind the hero content.
 * Purely decorative — isolated so the ambient animation can be
 * tuned or disabled without touching layout/content components.
 */
export function HeroBackground({ className }: HeroBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--color-primary)", opacity: 0.16 }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-[-10%] h-[380px] w-[380px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--color-accent)", opacity: 0.14 }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-1/3 h-[320px] w-[320px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--color-success)", opacity: 0.1 }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Base wash so the gradients sit on a consistent surface */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-background) 0%, var(--color-surface) 100%)",
          opacity: 0.15,
        }}
      />
    </div>
  );
}