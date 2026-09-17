"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { ResultCard } from "./ResultCard";
import type { ResultsGridProps } from "./results.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/**
 * ResultsGrid
 * Responsive grid of ResultCard items: 1 column mobile, 2 columns
 * tablet, 3 columns desktop. Takes `results` as a prop rather than
 * importing data directly, keeping it reusable for any future
 * results list (e.g. a filtered "JEE only" view).
 */
export function ResultsGrid({ results, className }: ResultsGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      role="list"
      aria-label="Student results"
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {results.map((result, index) => (
        <div key={result.id} role="listitem">
          <ResultCard result={result} index={index} />
        </div>
      ))}
    </motion.div>
  );
}