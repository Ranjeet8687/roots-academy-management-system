"use client";

import { motion, type Variants } from "framer-motion";
import { Award, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultCardProps } from "./results.types";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const badgeVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.08, rotate: -4, transition: { duration: 0.25, ease: "easeOut" } },
};

const photoVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.06, transition: { duration: 0.35, ease: "easeOut" } },
};

/**
 * ResultCard
 * Single student result card: photo placeholder with an AIR badge,
 * name, exam, selection, score, achievement line, and a selection
 * badge. Takes `result` + `index` as props so it stays reusable
 * outside ResultsGrid if ever needed.
 */
export function ResultCard({ result, index = 0, className }: ResultCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08 }}
      whileHover="hover"
      tabIndex={0}
      aria-label={`${result.name}, ${result.rank}, ${result.examName}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      style={{
        backgroundColor: "var(--color-background)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Photo placeholder + AIR badge */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-background) 100%)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <motion.span
          variants={photoVariants}
          className="flex h-20 w-20 items-center justify-center rounded-full text-[22px] font-bold"
          style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
          aria-hidden="true"
        >
          {result.initials}
        </motion.span>

        <motion.div
          variants={badgeVariants}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Award className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
          <span className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>
            {result.rank}
          </span>
        </motion.div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {result.name}
          </h3>
          <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            {result.examName}
          </p>
        </div>

        <p className="text-[14px] leading-[22px]" style={{ color: "var(--color-text-secondary)" }}>
          {result.achievement}
        </p>

        <div
          className="mt-auto flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {result.score}
          </span>
          <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            {result.year}
          </span>
        </div>

        {/* Selection badge */}
        <div
          className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "var(--color-success)" }} aria-hidden="true" />
          <span className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
            {result.selection}
          </span>
        </div>
      </div>
    </motion.article>
  );
}