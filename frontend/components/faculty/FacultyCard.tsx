"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Award, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FacultySocial } from "./FacultySocial";
import type { FacultyData } from "./faculty.types";

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

export interface FacultyCardProps {
  member: FacultyData;
  className?: string;
}

/**
 * FacultyCard
 * Premium glass card with gradient border, image zoom on hover,
 * and social icons that fade up on hover. Handles missing images gracefully.
 */
export function FacultyCard({ member, className }: FacultyCardProps) {
  const hasPhoto = member.photo && member.photo.trim() !== "";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, boxShadow: "var(--shadow-card-hover)" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)]",
        "bg-gradient-to-br from-[var(--color-primary)]/30 via-[var(--color-border)] to-[var(--color-accent)]/30",
        "p-[1px]",
        "transition-all duration-[var(--transition-smooth)]",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-xl)-1px)]"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="relative h-56 w-full overflow-hidden">
          {hasPhoto ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-105"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: "var(--color-primary-100)" }}>
              <UserCircle className="h-16 w-16" style={{ color: "var(--color-primary)", opacity: 0.5 }} aria-hidden="true" />
            </div>
          )}

          <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)", color: "var(--color-primary)" }}
          >
            {member.subject}
          </span>

          {member.featured && (
            <span
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)" }}
              aria-label="Featured faculty"
            >
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              Featured
            </span>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.4) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-[18px] font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>
              {member.name}
            </h3>
            <p className="mt-1 text-[13px] leading-tight" style={{ color: "var(--color-text-muted)" }}>
              {member.qualification}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              {member.experience} Experience
            </span>
            <span className="rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              {member.specialization}
            </span>
          </div>

          <p className="text-[14px] leading-[1.6] flex-1" style={{ color: "var(--color-text-secondary)" }}>
            {member.description}
          </p>

          <div className="mt-auto flex translate-y-2 items-center gap-2 pt-3 opacity-0 transition-[opacity,transform] duration-[var(--transition-smooth)] group-hover:translate-y-0 group-hover:opacity-100">
            <FacultySocial links={member.socialLinks} facultyName={member.name} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}