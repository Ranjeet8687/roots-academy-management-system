
"use client";

import { motion, type Variants } from "framer-motion";
import { SectionWrapper } from "@/components/layout";
import { CoursesGrid } from "./CoursesGrid";
import { CourseStats } from "./CourseStats";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
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

export function Courses() {
  return (
    <SectionWrapper
      id="courses"
      background="bg-background"
    >
      <div className="flex flex-col gap-10 sm:gap-12 lg:gap-16">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-1 text-center sm:gap-5"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide sm:px-4 sm:text-[13px]"
            style={{
              backgroundColor: "var(--color-primary-50)",
              color: "var(--color-primary)",
            }}
          >
            <span
              className="relative flex h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
              aria-hidden="true"
            />
            Our Programs
          </span>

          <h2
            className="text-[28px] leading-[36px] font-bold tracking-[-0.02em] sm:text-[38px] sm:leading-[46px] lg:text-[44px] lg:leading-[52px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            Courses Designed For Success
          </h2>

          <p
            className="max-w-2xl text-[14px] leading-[23px] sm:text-[17px] sm:leading-[28px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Choose the right program designed by experienced faculty to
            maximize your competitive exam performance.
          </p>
        </motion.div>

        {/* All 6 Courses */}
        <CoursesGrid />

        <CourseStats />

      </div>
    </SectionWrapper>
  );
}