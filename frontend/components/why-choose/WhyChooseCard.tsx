"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WhyChooseFeature } from "./whyChoose.types";

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

export interface WhyChooseCardProps {
  feature: WhyChooseFeature;
  className?: string;
}

/**
 * WhyChooseCard
 * Premium feature card for the Why Choose Us grid.
 */
export function WhyChooseCard({ feature, className }: WhyChooseCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, boxShadow: "var(--shadow-card-hover)" }}
      className={cn(
        "group relative flex flex-col gap-4 rounded-[var(--radius-xl)] p-6",
        "bg-[var(--color-surface)] border border-[var(--color-border)]",
        "shadow-[var(--shadow-card)]",
        "transition-all duration-[var(--transition-smooth)]",
        className,
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[var(--radius-xl)]"
        style={{ background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)" }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
        style={{ backgroundColor: "var(--color-primary-50)", transition: "all var(--transition-smooth)" }}
      >
        <Icon className="h-6 w-6" strokeWidth={2} style={{ color: "var(--color-primary)", transition: "all var(--transition-smooth)" }} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
          {feature.title}
        </h3>

        <p className="text-[15px] leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
          {feature.description}
        </p>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-[var(--radius-xl)]"
        style={{ background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)", transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-hidden="true"
      />
    </motion.div>
  );
}