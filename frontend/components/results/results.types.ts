import type { LucideIcon } from "lucide-react";

export type ExamCategory = "JEE" | "NEET" | "Olympiad";

export interface ResultRecord {
  id: string;
  /** Student full name */
  name: string;
  /** Initials shown on the placeholder avatar, e.g. "AS" */
  initials: string;
  category: ExamCategory;
  /** e.g. "JEE Advanced 2025" */
  examName: string;
  /** e.g. "AIR 12" */
  rank: string;
  /** e.g. "Selected into IIT Bombay CSE" */
  selection: string;
  /** e.g. "99.87 Percentile" */
  score: string;
  /** Short one-line achievement/summary */
  achievement: string;
  year: string;
}

export interface ResultStat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface ResultsHeaderProps {
  className?: string;
}

export interface ResultCardProps {
  result: ResultRecord;
  /** Index within the grid, used to stagger the reveal delay */
  index?: number;
  className?: string;
}

export interface ResultsGridProps {
  results: ResultRecord[];
  className?: string;
}

export interface ResultStatsProps {
  stats: ResultStat[];
  className?: string;
}