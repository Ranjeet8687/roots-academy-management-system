"use client";

import { motion, type Variants } from "framer-motion";
import { SectionWrapper } from "@/components/layout";
import { FacultyGrid } from "./FacultyGrid";

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

/**
 * Faculty
 * Section introducing the institute's mentors.
 */
export function Faculty() {
  return (
      <SectionWrapper
        id="faculty"
        background="bg-background"
      >      
      <div className="flex flex-col gap-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <span className="text-[var(--text-caption)] font-[var(--font-weight-semibold)] uppercase tracking-wide text-[var(--color-primary)]">
            Meet Our Mentors
          </span>

          <h2 className="text-[var(--text-heading)] font-[var(--font-weight-bold)] leading-[var(--leading-heading)] text-[var(--color-text-primary)]">
            Learn From India&apos;s Best Faculty
          </h2>

          <p className="text-[var(--text-body)] leading-[var(--leading-body)] text-[var(--color-text-secondary)]">
            Our experienced mentors have guided thousands of students towards
            IITs, NITs, AIIMS and top universities.
          </p>
        </motion.div>

        <FacultyGrid />
      </div>
    </SectionWrapper>
  );
}