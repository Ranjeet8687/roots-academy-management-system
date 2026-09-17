"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AboutFeaturesProps } from "./about.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/**
 * AboutFeatures
 * Grid of feature cards. Takes `features` as a prop rather than
 * importing data directly, keeping it reusable for any future
 * feature list elsewhere in the app.
 */
export function AboutFeatures({ features, className }: AboutFeaturesProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}
    >
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.id}
            variants={cardVariants}
            className="flex items-start gap-3 rounded-[var(--radius-lg)] p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ backgroundColor: "var(--color-background)" }}
            >
              <Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {feature.title}
              </h3>
              <p className="text-[13px] leading-[20px]" style={{ color: "var(--color-text-secondary)" }}>
                {feature.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}