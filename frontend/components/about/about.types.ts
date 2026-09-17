import type { LucideIcon } from "lucide-react";

export interface AboutFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AboutBadgeData {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface FounderData {
  id: string;
  name: string;
  role: string;
  description: string;
  initials: string;
}

export interface AboutContentProps {
  className?: string;
}

export interface AboutImageProps {
  className?: string;
}

export interface AboutFeaturesProps {
  features: AboutFeature[];
  className?: string;
}