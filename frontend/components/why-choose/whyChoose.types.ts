import type { LucideIcon } from "lucide-react";

export interface WhyChooseFeature {
  /** Unique, stable identifier — used as the React key */
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}