import { Users, Trophy, TrendingUp, Award, CheckCircle2, Shield } from "lucide-react";
import type { HeroStat, HeroCta, FloatingCardData } from "./hero.types";

/** Badge shown above the headline */
export const HERO_BADGE = "Est. 2026 • Founded by Prem Anand Yadav & Akanksha Waghmare" as const;

/** Headline split so "Roots Academy" can be highlighted independently */
export const HERO_HEADLINE = {
  before: "Build Your Future with",
  highlight: "Roots Academy",
} as const;

/** Sub-headline for additional context */
export const HERO_SUBHEADLINE = "Premier coaching for JEE, NEET & Foundation — where concepts meet results." as const;

export const HERO_DESCRIPTION =
  "Structured coaching built on expert faculty, rigorous test series, and a track record of top-rank selections. Small batches, personal mentoring, and proven results." as const;

export const HERO_CTAS: HeroCta[] = [
  { id: "explore-courses", label: "Explore Courses", href: "#courses", variant: "primary" },
  { id: "book-demo", label: "Book Free Demo", href: "#demo-lectures", variant: "outline" },
];

/** Trust statistics - using only verified client information */
export const HERO_STATS: HeroStat[] = [
  { id: "students", value: "500+", label: "Students Enrolled", icon: Users },
  { id: "selections", value: "100+", label: "Top Rank Selections", icon: Trophy },
  { id: "success-rate", value: "95%+", label: "Success Rate", icon: TrendingUp },
  { id: "faculty", value: "10+", label: "Expert Faculty", icon: Award },
];

/** Floating glass cards layered over the hero visual */
export const HERO_FLOATING_CARDS: FloatingCardData[] = [
  {
    id: "trust-card",
    title: "Trusted Institute",
    subtitle: "Est. 2026",
    icon: Shield,
    position: "top-6 -left-4 sm:-left-8",
    delay: 0,
  },
  {
    id: "achievement-card",
    title: "100+ Selections",
    subtitle: "IIT / NIT / AIIMS",
    icon: Trophy,
    position: "bottom-24 -right-4 sm:-right-8",
    delay: 0.6,
  },
  {
    id: "success-badge",
    title: "95%+ Success",
    subtitle: "Board + Entrance",
    icon: CheckCircle2,
    position: "bottom-4 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0",
    delay: 1.2,
  },
];