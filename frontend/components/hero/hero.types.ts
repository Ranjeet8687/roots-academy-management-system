import type { LucideIcon } from "lucide-react";

export interface HeroStat {
  id: string;
  /** e.g. "5000+" */
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface HeroCta {
  id: string;
  label: string;
  href: string;
  variant: "primary" | "outline";
}

export interface FloatingCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Tailwind position classes, kept in data so layout can be tuned without touching component code */
  position: string;
  /** Vertical float animation delay, in seconds */
  delay: number;
}

export interface HeroContentProps {
  className?: string;
}

export interface HeroStatsProps {
  stats: HeroStat[];
  className?: string;
}

export interface HeroVisualProps {
  className?: string;
}

export interface HeroBackgroundProps {
  className?: string;
}