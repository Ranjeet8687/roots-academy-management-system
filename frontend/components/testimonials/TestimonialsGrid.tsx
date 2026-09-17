"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { TestimonialCard } from "./TestimonialCard";
import type { TestimonialsGridProps } from "./testimonials.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/**
 * TestimonialsGrid
 * Below `sm`: a horizontally scrolling, snap-aligned carousel (one
 * card at a time). At `sm` and up: a static responsive grid
 * (2 columns tablet, 3 columns desktop). Takes `testimonials` as a
 * prop rather than importing data directly, keeping it reusable
 * for any future filtered/curated testimonial list.
 */
export function TestimonialsGrid({ testimonials, className }: TestimonialsGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      role="list"
      aria-label="Student and parent testimonials"
      className={cn(
        // Mobile carousel
        "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Desktop grid
        "sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3",
        className
      )}
    >
      {testimonials.map((testimonial, index) => (
        <div
          key={testimonial.id}
          role="listitem"
          className="w-[85%] shrink-0 snap-center sm:w-auto sm:shrink"
        >
          <TestimonialCard testimonial={testimonial} index={index} className="h-full" />
        </div>
      ))}
    </motion.div>
  );
}