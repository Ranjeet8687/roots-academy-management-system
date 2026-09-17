"use client";

import { motion } from "framer-motion";
import type { HeroStatsProps } from "./hero.types";
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.4,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * HeroStats
 * Renders the 4 key proof-point statistics under the hero copy.
 * Takes `stats` as a prop (not imported data) so it stays reusable
 * for any future stat set, e.g. a per-course stats block.
 */
export function HeroStats({ stats, className }: HeroStatsProps) {
  return (
    <motion.dl
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className ?? "grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.id} variants={itemVariants} className="flex flex-col gap-1.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
              style={{ backgroundColor: "var(--color-primary-50)" }}
            >
              <Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
            </div>
            <dt
              className="text-[28px] font-extrabold tracking-[-0.02em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              {stat.value}
            </dt>
            <dd className="text-[13px] font-medium leading-tight" style={{ color: "var(--color-text-secondary)" }}>
              {stat.label}
            </dd>
          </motion.div>
        );
      })}
    </motion.dl>
  );
}