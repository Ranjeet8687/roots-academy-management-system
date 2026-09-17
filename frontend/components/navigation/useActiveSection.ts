"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently dominant in the viewport
 * using IntersectionObserver, and drives the Navbar's active-link
 * highlight on this single-page, anchor-based layout.
 *
 * Uses a thin rootMargin band near the vertical center of the
 * screen so only the section actually "in focus" counts as active —
 * not just any section that happens to have a sliver visible.
 */
export function useActiveSection(defaultId = "home"): string {
  const [activeSection, setActiveSection] = useState(defaultId);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only consider sections currently intersecting the center band
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        // Thin horizontal band centered in the viewport — a section
        // only counts as "active" once it's actually near the middle
        // of the screen, not merely edge-visible.
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeSection;
}