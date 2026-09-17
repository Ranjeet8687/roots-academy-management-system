"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { HERO_FLOATING_CARDS } from "./hero.data";
import type { HeroVisualProps, FloatingCardData } from "./hero.types";

function FloatingCard({ card }: { card: FloatingCardData }) {
  const Icon = card.icon;
  return (
    <motion.div
      className={cn("absolute z-10 flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3", card.position)}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "var(--shadow-glass)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: card.delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: card.delay },
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
        style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)" }}
      >
        <Icon className="h-5 w-5" color="#FFFFFF" aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <span className="text-[15px] font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>
          {card.title}
        </span>
        <span className="text-[12px] leading-tight" style={{ color: "var(--color-text-secondary)" }}>
          {card.subtitle}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * HeroVisual
 * Right column: a real academy/classroom photo with floating glass achievement cards layered on top.
 */
export function HeroVisual({ className }: HeroVisualProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={cn("relative mx-auto w-full max-w-lg lg:max-w-xl", className)}
    >
      {/* Main classroom image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-2xl)]" style={{ boxShadow: "var(--shadow-xl)" }}>
        <Image
          src="/images/classrooms/classroom-1.jpg"
          alt="Roots Academy modern classroom with students learning"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[var(--transition-slow)] hover:scale-[1.02]"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/* Fallback if image fails to load */}
        <div
          data-fallback
          className="hidden absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-primary-100)" }}
        >
          <div className="text-center p-8" style={{ color: "var(--color-text-muted)" }}>
            <div className="text-[18px] font-medium">Roots Academy</div>
            <div className="text-[13px] mt-2 opacity-70">Classroom Image</div>
          </div>
        </div>

        {/* Subtle gradient overlay at bottom for card readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{
          background: "linear-gradient(to top, rgba(15, 23, 42, 0.35) 0%, transparent 100%)",
          pointerEvents: "none",
        }} aria-hidden="true" />
      </div>

      {/* Floating achievement cards */}
      {HERO_FLOATING_CARDS.map((card) => (
        <FloatingCard key={card.id} card={card} />
      ))}
    </motion.div>
  );
}