"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { NavLogo } from "./NavLogo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";
import { NAV_ITEMS } from "./navigation.data";
import { useActiveSection } from "./useActiveSection";

const SCROLL_THRESHOLD = 8;

/**
 * Navbar
 * Sticky top navigation. Transparent at the top of the page,
 * transitions to a blurred surface once the user scrolls past
 * SCROLL_THRESHOLD. Composes NavLogo, DesktopNav, MobileNav and
 * NavActions — no navigation logic lives here beyond orchestration.
 */
export function Navbar() {
  const pathname = usePathname();
  const activeSection = useActiveSection();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the drawer automatically on route change
  useEffect(() => {
    const timer = setTimeout(() => setIsMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0"
      style={{ zIndex: "var(--z-sticky)" as unknown as number }}
    >
      <div
        className={cn(
          "transition-[background-color,box-shadow,backdrop-filter,border-color] duration-300 ease-out",
          "bg-background/80 backdrop-blur-md",
          isScrolled && "bg-background/95 backdrop-blur-lg shadow-[var(--shadow-md)] border-b border-[var(--color-border)]"
        )}
        style={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(12px)",
          WebkitBackdropFilter: isScrolled ? "blur(20px)" : "blur(12px)",
        }}
      >
        <Container>
          <div className="flex h-[var(--header-height)] items-center justify-between gap-2">
            {/* Branding - takes available space, allows truncation */}
            <div className="min-w-0 flex-1">
              <NavLogo />
            </div>

            {/* Desktop navigation and actions */}
            <div className="flex items-center gap-2 shrink-0">
              <DesktopNav
                items={NAV_ITEMS}
                activePath={activeSection}
              />
              <NavActions className="hidden md:flex" />
            </div>

            {/* Mobile hamburger button - always shrink-0, visible only on mobile */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
              className={cn(
                "inline-flex items-center justify-center rounded-[var(--radius-md)] p-2 md:hidden shrink-0",
                "transition-colors duration-200",
                "hover:bg-[var(--color-surface)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              )}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </Container>
      </div>

      <MobileNav
        items={NAV_ITEMS}
        activePath={activeSection}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </motion.header>
  );
}