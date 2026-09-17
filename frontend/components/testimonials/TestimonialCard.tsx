"use client";

import { motion, type Variants } from "framer-motion";
import { Quote, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestimonialCardProps } from "./testimonials.types";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/**
 * TestimonialCard
 * Single testimonial card: a generic identity icon (no real names or
 * photos were provided), an anonymized label/course, and the review
 * quote. Takes `testimonial` + `index` as props so it stays reusable
 * outside TestimonialsGrid if ever needed.
 */
export function TestimonialCard({ testimonial, index = 0, className }: TestimonialCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.015 }}
      tabIndex={0}
      aria-label={`Testimonial from a ${testimonial.label}`}
      className={cn(
        "flex h-full flex-col gap-5 rounded-[var(--radius-lg)] p-6",
        "shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      style={{
        backgroundColor: "var(--color-background)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Quote
        className="h-7 w-7"
        style={{ color: "var(--color-primary)", opacity: 0.25 }}
        aria-hidden="true"
      />

      <p className="flex-1 text-[14px] leading-[24px]" style={{ color: "var(--color-text-secondary)" }}>
        &ldquo;{testimonial.review}&rdquo;
      </p>

      <div
        className="flex items-center gap-3 pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-surface)" }}
          aria-hidden="true"
        >
          <UserRound className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
        </span>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {testimonial.label}
          </span>
          <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            {testimonial.course}
          </span>
        </div>
      </div>
    </motion.article>
  );
}