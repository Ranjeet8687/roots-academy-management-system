
import { Award, Target, Users } from "lucide-react";
import type { AboutFeature, AboutBadgeData, FounderData } from "./about.types";

export const ABOUT_SECTION_LABEL = "About Roots Academy" as const;

export const ABOUT_HEADING = "Building Strong Foundations for Future Success" as const;

export const ABOUT_DESCRIPTION =
  "Roots Academy is dedicated to helping JEE, NEET, and Foundation students build strong concepts, develop confidence, and achieve their academic goals through focused learning and meaningful mentorship." as const;

export const ABOUT_CTA = {
  label: "Meet Our Faculty",
  href: "#faculty",
} as const;

export const ABOUT_BADGE: AboutBadgeData = {
  title: "Est. 2026",
  subtitle: "Building Foundations, Achieving Success",
  icon: Award,
};

/** Founders information */
export const FOUNDERS: FounderData[] = [
  {
    id: "prem-anand",
    name: "Mr. Prem Anand Yadav",
    role: "Co-Founder & Physics Faculty",
    description:
      "IIT alumnus with 15+ years of experience guiding JEE aspirants. Specializes in Mechanics and Electrodynamics.",
    initials: "PY",
  },
  {
    id: "akanksha-waghmare",
    name: "Ms. Akanksha Waghmare",
    role: "Co-Founder & Academic Director",
    description:
      "Education leader focused on curriculum design, student mentorship, and creating structured learning pathways.",
    initials: "AW",
  },
];

/**
 * About section story points.
 * Detailed facilities and benefits belong in Why Choose Us.
 */
export const ABOUT_FEATURES: AboutFeature[] = [
  {
    id: "strong-foundation",
    title: "Strong Academic Foundation",
    description:
      "We focus on building clear concepts and strong fundamentals that help students approach challenging problems with confidence.",
    icon: Target,
  },
  {
    id: "student-focused",
    title: "Student-Centered Learning",
    description:
      "Every student deserves guidance, encouragement, and a learning environment that supports their individual growth.",
    icon: Users,
  },
  {
    id: "future-ready",
    title: "A Vision for Success",
    description:
      "Our aim is to nurture disciplined, curious, and confident learners prepared for their academic journey ahead.",
    icon: Award,
  },
];