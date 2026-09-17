"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { ABOUT_BADGE } from "./about.data";
import type { AboutImageProps } from "./about.types";

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.3 },
  },
};

/**
 * AboutImage
 * Clean academy building visual for the About section.
 * Uses real campus photo with establishment badge.
 */
export function AboutImage({ className }: AboutImageProps) {
  return (
    <motion.div
      variants={imageVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={cn("relative mx-auto w-full max-w-lg lg:max-w-xl", className)}
    >
      {/* Main academy building image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-2xl)]" style={{ boxShadow: "var(--shadow-xl)" }}>
        <Image
          src="/images/gallery/academy-building.jpg"
          alt="Roots Academy campus building exterior"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/* Fallback if image fails to load */}
        <div
          data-fallback
          className="hidden absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-primary-100)" }}
        >
          <div className="text-center p-8" style={{ color: "var(--color-text-muted)" }}>
            <div className="text-[18px] font-medium">Roots Academy</div>
            <div className="text-[13px] mt-2 opacity-70">Campus Building</div>
          </div>
        </div>
      </div>

      {/* Establishment badge */}
      <motion.div
        variants={badgeVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 sm:-right-6"
        style={{
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Award className="h-5 w-5" color="#FFFFFF" aria-hidden="true" />
        </span>

        <div className="flex flex-col">
          <span
            className="text-[15px] font-bold leading-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {ABOUT_BADGE.title}
          </span>

          <span
            className="text-[12px] leading-tight"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {ABOUT_BADGE.subtitle}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}