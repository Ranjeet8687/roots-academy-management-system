
"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ABOUT_SECTION_LABEL,
  ABOUT_HEADING,
  ABOUT_DESCRIPTION,
  ABOUT_CTA,
  FOUNDERS,
} from "./about.data";
import type { AboutContentProps } from "./about.types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export function AboutContent({ className }: AboutContentProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={cn("flex flex-col gap-6", className)}
    >
      {/* Section label */}
      <motion.span
        variants={fadeUp}
        className="text-[13px] font-semibold uppercase tracking-[0.04em]"
        style={{ color: "var(--color-primary)" }}
      >
        {ABOUT_SECTION_LABEL}
      </motion.span>

      {/* Heading */}
      <motion.h2
        variants={fadeUp}
        className="text-[32px] leading-[40px] font-bold tracking-[-0.01em] sm:text-[38px] sm:leading-[46px] lg:text-[44px] lg:leading-[52px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {ABOUT_HEADING}
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeUp}
        className="max-w-xl text-[16px] leading-[26px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {ABOUT_DESCRIPTION}
      </motion.p>

      {/* Founders */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {FOUNDERS.map((founder) => (
          <div
            key={founder.id}
            className="flex gap-4 rounded-[var(--radius-lg)] p-4"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)",
              }}
            >
              <span className="text-[14px] font-bold text-white">
                {founder.initials}
              </span>
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <h3
                className="text-[15px] font-semibold leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                {founder.name}
              </h3>

              <p
                className="text-[12px] font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                {founder.role}
              </p>

              <p
                className="mt-1 line-clamp-2 text-[13px] leading-[20px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {founder.description}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Our Vision */}
      <motion.div
        variants={fadeUp}
        className="rounded-[var(--radius-lg)] p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{
              backgroundColor: "var(--color-primary-50)",
            }}
          >
            <Target
              className="h-5 w-5"
              style={{ color: "var(--color-primary)" }}
              aria-hidden="true"
            />
          </div>

          <h3
            className="text-[17px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Our Vision
          </h3>
        </div>

        <p
          className="text-[14px] leading-[23px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          To nurture disciplined, curious, and confident learners who build
          strong foundations and achieve their academic goals through
          meaningful mentorship.
        </p>
      </motion.div>

      {/* Teaching approach */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <div
          className="flex items-start gap-3 rounded-[var(--radius-lg)] p-4"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <BookOpen
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <div>
            <h4
              className="text-[14px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Strong Foundations
            </h4>
            <p
              className="mt-1 text-[12px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Concepts before shortcuts.
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-[var(--radius-lg)] p-4"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Users
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <div>
            <h4
              className="text-[14px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Personal Guidance
            </h4>
            <p
              className="mt-1 text-[12px] leading-[18px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Every student matters.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeUp} className="pt-1">
        <Link
          href={ABOUT_CTA.href}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-6 py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)",
            boxShadow: "var(--shadow-button)",
          }}
        >
          {ABOUT_CTA.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </motion.div>
  );
}