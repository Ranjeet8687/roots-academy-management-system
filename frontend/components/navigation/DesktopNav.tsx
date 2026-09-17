"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DesktopNavProps } from "./navigation.types";

/**
 * DesktopNav
 * Horizontal navigation for desktop.
 * Highlights the section currently visible on screen.
 */
export function DesktopNav({
  items,
  activePath,
  className,
}: DesktopNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn("hidden md:flex items-center gap-1", className)}
    >
      {items.map((item) => {
        // Compare section id instead of href
        const isActive = activePath === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative px-3 py-2.5 text-[14px] font-medium",
              "rounded-[var(--radius-md)]",
              "transition-all duration-200 ease-out",
              isActive
                ? "text-[var(--color-primary)] bg-[var(--color-primary-50)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
            )}
          >
            {item.label}

            {/* Active indicator */}
            {isActive && (
              <motion.span
                layoutId="active-nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6"
                style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-full)" }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}