import type { LucideIcon } from "lucide-react";

export type CourseMode = "Offline" | "Online" | "Hybrid";

/**
 * CourseData
 * Represents a single course offered by the institute.
 * Designed to map directly to a future CMS/API response.
 */
export interface CourseData {
  /** Unique identifier */
  id: string;

  /** URL-friendly slug */
  slug: string;

  /** Course title */
  title: string;

  /** Short description shown on the card */
  description: string;

  /** Course duration */
  duration: string;

  /** Delivery mode */
  mode: CourseMode;

  /** Lucide icon displayed on the card */
  icon: LucideIcon;

  /** Optional cover image */
  image?: string;

  /** Small badge shown on the card (Popular, New, Foundation, etc.) */
  badge?: string;

  /** Course highlights/features */
  features: string[];
}