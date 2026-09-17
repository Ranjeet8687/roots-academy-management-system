"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_BADGE, HERO_HEADLINE, HERO_SUBHEADLINE, HERO_DESCRIPTION, HERO_CTAS, HERO_STATS } from "./hero.data";
import { HeroStats } from "./HeroStats";
import type { HeroContentProps } from "./hero.types";

import type { Variants } from "framer-motion";

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

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/**
 * HeroContent
 * Left column: badge, headline, sub-headline, description, CTA pair and stats.
 * Purely presentational — all copy comes from hero.data.ts so it
 * can be swapped or localized without touching this component.
 */
export function HeroContent({ className }: HeroContentProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col gap-6", className)}
    >
      {/* Badge */}
      <motion.div
        variants={fadeUp}
        className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2"
        style={{ backgroundColor: "var(--color-primary-50)", border: "1px solid var(--color-primary-200)" }}
      >
        <Sparkles className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
        <span className="text-[13px] font-medium" style={{ color: "var(--color-primary-700)" }}>
          {HERO_BADGE}
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        className="text-[40px] leading-[48px] font-extrabold tracking-[-0.02em] sm:text-[52px] sm:leading-[60px] lg:text-[64px] lg:leading-[72px] xl:text-[72px] xl:leading-[80px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {HERO_HEADLINE.before}{" "}
        <span style={{ color: "var(--color-primary)" }}>{HERO_HEADLINE.highlight}</span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        variants={fadeUp}
        className="text-[18px] leading-[28px] font-medium max-w-xl"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {HERO_SUBHEADLINE}
      </motion.p>

      {/* Description */}
      <motion.p
        variants={fadeUp}
        className="max-w-xl text-[16px] leading-[26px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {HERO_DESCRIPTION}
      </motion.p>

      {/* CTAs */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-2">
        {HERO_CTAS.map((cta) => {
          const isPrimary = cta.variant === "primary";
          return (
            <motion.div key={cta.id} whileHover="hover" initial="rest" animate="rest">
              <Link
                href={cta.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-6 py-3.5 text-[15px] font-semibold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                )}
                style={
                  isPrimary
                    ? {
                        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)",
                        color: "#FFFFFF",
                        boxShadow: "var(--shadow-button)",
                        transition: "all var(--transition-smooth)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                        transition: "all var(--transition-smooth)",
                      }
                }
              >
                {isPrimary ? (
                  <motion.span
                    className="inline-flex items-center gap-2"
                    variants={{ rest: { x: 0 }, hover: { x: 2 } }}
                    transition={{ duration: 0.2 }}
                  >
                    {cta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    {cta.label}
                  </>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="pt-6">
          <HeroStats stats={HERO_STATS} />
        </div>
      </motion.div>
    </motion.div>
  );
}