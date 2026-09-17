
"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Clock, Users2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseData } from "./courses.types";

const fadeUp: Variants = {
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

export interface CourseCardProps {
  course: CourseData;
  className?: string;
}

export function CourseCard({
  course,
  className,
}: CourseCardProps) {
  const Icon = course.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -4,
        boxShadow: "var(--shadow-card-hover)",
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "rounded-[var(--radius-xl)]",
        "bg-[var(--color-surface)]",
        "border border-[var(--color-border)]",
        "shadow-[var(--shadow-card)]",
        "p-4 sm:p-5 lg:p-6",
        "transition-shadow duration-300",
        className,
      )}
    >
      {/* Top gradient accent */}
      <div
        className="absolute left-0 right-0 top-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Header: Icon + Badge */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] sm:h-12 sm:w-12"
          style={{
            backgroundColor: "var(--color-primary-50)",
          }}
        >
          <Icon
            className="h-6 w-6 sm:h-7 sm:w-7"
            strokeWidth={2}
            style={{ color: "var(--color-primary)" }}
          />
        </div>

        {course.badge && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:text-[11px]"
            style={{
              backgroundColor: "var(--color-primary-50)",
              color: "var(--color-primary)",
            }}
          >
            {course.badge}
          </span>
        )}
      </div>

      {/* Course Content */}
      <div className="mt-4 flex flex-1 flex-col gap-3">
        <h3
          className="text-[18px] font-bold leading-[1.35] sm:text-[20px]"
          style={{ color: "var(--color-text-primary)" }}
        >
          {course.title}
        </h3>

        <p
          className="text-[14px] leading-[1.6] sm:text-[15px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {course.description}
        </p>

        {/* Duration + Mode */}
        <div
          className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] sm:text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {course.duration}
          </span>

          <span className="flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5 shrink-0" />
            {course.mode}
          </span>
        </div>

        {/* Features */}
        <ul
          className="flex flex-col gap-2 border-t pt-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          {course.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-[12px] leading-[1.5] sm:text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--color-success)" }}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div
          className="mt-auto border-t pt-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            type="button"
            className={cn(
              "group/btn flex min-h-12 w-full items-center justify-center gap-2",
              "rounded-[var(--radius-md)] px-4 py-3",
              "text-[14px] font-semibold text-white sm:text-[15px]",
              "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-700)]",
              "shadow-[var(--shadow-button)]",
              "transition-all duration-300",
              "hover:shadow-[var(--shadow-button-hover)]",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--color-primary)]",
              "focus-visible:ring-offset-2",
            )}
            aria-label={`Enquire about ${course.title}`}
          >
            Enquire Now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}