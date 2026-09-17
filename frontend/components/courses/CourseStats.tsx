"use client";

import { motion, type Variants } from "framer-motion";

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

interface StatItem {
  id: string;
  label: string;
  value: string;
}

const stats: StatItem[] = [
  { id: "students", label: "Students Trained", value: "12,000+" },
  { id: "success-rate", label: "Success Rate", value: "98%" },
  { id: "faculty", label: "Expert Faculty", value: "200+" },
  { id: "experience", label: "Years of Excellence", value: "15+" },
];

/**
 * CourseStats
 * Summary strip of institute-wide numbers shown beneath the course grid.
 */
export function CourseStats() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="grid grid-cols-2 gap-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <div key={stat.id} className="flex flex-col items-center gap-1 text-center">
          <span className="text-[var(--text-heading)] font-[var(--font-weight-extrabold)] text-[var(--color-primary)]">
            {stat.value}
          </span>
          <span className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}