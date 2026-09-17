"use client";

import { motion, type Variants } from "framer-motion";
import { SectionWrapper } from "@/components/layout";
import { WhyChooseGrid } from "./WhyChooseGrid";

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
 * WhyChoose
 * Section highlighting the institute's core differentiators.
 */
export function WhyChoose() {
  return (
    <SectionWrapper
      id="why-choose"
      background="bg-background"
    >
      <div className="flex flex-col gap-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
          >
            <span className="relative flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} aria-hidden="true" />
            Why Choose Roots Academy
          </span>

          <h2 className="text-[32px] leading-[40px] font-bold tracking-[-0.01em] sm:text-[38px] sm:leading-[46px] lg:text-[44px] lg:leading-[52px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            Excellence That Drives Success
          </h2>

          <p className="max-w-2xl text-[17px] leading-[28px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Our structured teaching methodology, experienced faculty, and
            student-first approach help every learner achieve their highest
            potential.
          </p>
        </motion.div>

        <WhyChooseGrid />
      </div>
    </SectionWrapper>
  );
}