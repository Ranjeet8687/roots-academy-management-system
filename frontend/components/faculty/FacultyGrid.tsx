"use client";

import { motion, type Variants } from "framer-motion";
import { FacultyCard } from "./FacultyCard";
import { faculty } from "./faculty.data";

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * FacultyGrid
 * Responsive grid that staggers each faculty card's entrance.
 */
export function FacultyGrid() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      role="list"
      aria-label="Faculty members"
    >
      {faculty.map((member) => (
        <FacultyCard key={member.id} member={member} />
      ))}
    </motion.div>
  );
}