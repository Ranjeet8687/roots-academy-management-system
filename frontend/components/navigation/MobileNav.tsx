"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_CTA } from "./navigation.data";
import type { MobileNavProps } from "./navigation.types";

/**
 * MobileNav
 * Slide-in drawer for sub-md viewports.
 * Highlights the currently active section.
 */
export function MobileNav({
  items,
  activePath,
  isOpen,
  onClose,
}: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-nav-backdrop"
            className="fixed inset-0 md:hidden"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              zIndex: "var(--z-overlay)" as unknown as number,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={cn(
              "fixed top-0 right-0 h-full w-[85%] max-w-sm md:hidden",
              "flex flex-col"
            )}
            style={{
              backgroundColor: "var(--color-background)",
              boxShadow: "var(--shadow-2xl)",
              zIndex: "var(--z-modal)" as unknown as number,
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 32,
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span
                className="text-[15px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Menu
              </span>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className={cn(
                  "rounded-[var(--radius-sm)] p-2",
                  "transition-colors duration-200",
                  "hover:bg-[var(--color-surface)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                )}
              >
                <X className="h-5 w-5" style={{ color: "var(--color-text-primary)" }} />
              </button>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-4 py-5 overflow-y-auto"
            >
              {items.map((item, index) => {
                const isActive = activePath === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 * index,
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block rounded-[var(--radius-md)] px-4 py-3.5 text-[15px] font-medium",
                        "transition-all duration-200",
                        isActive
                          ? "text-[var(--color-primary)] bg-[var(--color-primary-50)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div
              className="mt-auto px-5 pb-5 pt-4"
              style={{
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <Link
                href={NAV_CTA.href}
                onClick={onClose}
                className={cn(
                  "flex w-full items-center justify-center gap-2",
                  "rounded-[var(--radius-md)] px-4 py-3.5",
                  "text-[14px] font-semibold text-white",
                  "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-700)]",
                  "shadow-[var(--shadow-button)]",
                  "transition-all duration-200",
                  "hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-0.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                )}
              >
                {NAV_CTA.label}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}