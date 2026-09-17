import type { NavItem } from "./navigation.types";

/**
 * Primary navigation items. Centralized so any future API-driven
 * navigation (e.g. CMS-managed menu) can replace this array without
 * touching component code.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about" },
  { id: "courses", label: "Courses", href: "#courses" },
  { id: "faculty", label: "Faculty", href: "#faculty" },
  { id: "demo-lectures", label: "Free Demo", href: "#demo-lectures" },
  { id: "results", label: "Results", href: "#results" },
  // { id: "gallery", label: "Gallery", href: "#gallery" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export const NAV_CTA = {
  label: "Enroll Now",
  href: "/enroll",
} as const;

export const BRAND_NAME = "Roots Academy" as const;
export const BRAND_TAGLINE = "BUILDING FOUNDATION, ACHIEVING SUCCESS" as const;