"use client";

import { motion, type Variants } from "framer-motion";
import { WhyChooseCard } from "./WhyChooseCard";
import { WHY_CHOOSE_FEATURES } from "./whyChoose.data";

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/**
 * WhyChooseGrid
 * Responsive grid that staggers each feature card's entrance.
 */
export function WhyChooseGrid() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Reasons to choose Roots Academy"
    >
      {WHY_CHOOSE_FEATURES.map((feature) => (
        <WhyChooseCard key={feature.id} feature={feature} />
      ))}
    </motion.div>
  );
}