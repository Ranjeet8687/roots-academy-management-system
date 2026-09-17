"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ResultStatsProps } from "./results.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/**
 * ResultStats
 * Bottom summary row (Selections, IIT, NIT, AIIMS, Success Rate).
 * Takes `stats` as a prop rather than importing data directly, so
 * it stays reusable for any future summary-stat block.
 */
export function ResultStats({ stats, className }: ResultStatsProps) {
  return (
    <motion.dl
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={cn(
        "grid grid-cols-2 gap-6 rounded-[var(--radius-xl)] p-8 sm:grid-cols-3 lg:grid-cols-5",
        className
      )}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.id} variants={itemVariants} className="flex flex-col items-center gap-2 text-center">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
              style={{ backgroundColor: "var(--color-background)" }}
            >
              <Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
            </span>
            <dt
              className="text-[24px] font-bold tracking-[-0.01em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              {stat.value}
            </dt>
            <dd className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              {stat.label}
            </dd>
          </motion.div>
        );
      })}
    </motion.dl>
  );
}