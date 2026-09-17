import { Trophy, GraduationCap, Building2, HeartPulse, TrendingUp } from "lucide-react";
import type { ResultRecord, ResultStat } from "./results.types";

export const RESULTS_LABEL = "TOP RESULTS" as const;

export const RESULTS_HEADING = "Our Students Make Us Proud" as const;

export const RESULTS_DESCRIPTION =
  "Celebrating outstanding performances in JEE, NEET and Olympiads through dedication, mentorship and hard work." as const;

/**
 * Student results rendered in the grid. Data-driven so a future
 * CMS/API can supply this array without changing components.
 */
export const RESULTS_DATA: ResultRecord[] = [
  {
    id: "ananya-sharma",
    name: "Ananya Sharma",
    initials: "AS",
    category: "JEE",
    examName: "JEE Advanced 2025",
    rank: "AIR 12",
    selection: "Selected into IIT Bombay CSE",
    score: "99.87 Percentile",
    achievement: "State topper, two-time Olympiad qualifier.",
    year: "2025",
  },
  {
    id: "rohan-mehta",
    name: "Rohan Mehta",
    initials: "RM",
    category: "JEE",
    examName: "JEE Advanced 2025",
    rank: "AIR 47",
    selection: "Selected into IIT Delhi EE",
    score: "99.62 Percentile",
    achievement: "Consistent top-10 across all mock test series.",
    year: "2025",
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    initials: "PN",
    category: "NEET",
    examName: "NEET UG 2025",
    rank: "AIR 89",
    selection: "Selected into AIIMS New Delhi",
    score: "705 / 720",
    achievement: "Perfect biology score across final test series.",
    year: "2025",
  },
  {
    id: "arjun-verma",
    name: "Arjun Verma",
    initials: "AV",
    category: "JEE",
    examName: "JEE Advanced 2024",
    rank: "AIR 156",
    selection: "Selected into IIT Kanpur ME",
    score: "99.21 Percentile",
    achievement: "Improved rank by 4,000+ places in final year.",
    year: "2024",
  },
  {
    id: "kavya-reddy",
    name: "Kavya Reddy",
    initials: "KR",
    category: "NEET",
    examName: "NEET UG 2024",
    rank: "AIR 203",
    selection: "Selected into AIIMS Jodhpur",
    score: "698 / 720",
    achievement: "Class topper, Foundation batch alumna.",
    year: "2024",
  },
  {
    id: "aditya-singh",
    name: "Aditya Singh",
    initials: "AS",
    category: "Olympiad",
    examName: "International Physics Olympiad 2025",
    rank: "Gold Medalist",
    selection: "Selected into IIT Madras Physics",
    score: "Top 1% Nationally",
    achievement: "Represented India at the international level.",
    year: "2025",
  },
  {
    id: "sanya-kapoor",
    name: "Sanya Kapoor",
    initials: "SK",
    category: "JEE",
    examName: "JEE Advanced 2024",
    rank: "AIR 312",
    selection: "Selected into IIT Roorkee CSE",
    score: "98.94 Percentile",
    achievement: "Balanced boards and JEE with a 96% Class XII score.",
    year: "2024",
  },
  {
    id: "vikram-rao",
    name: "Vikram Rao",
    initials: "VR",
    category: "NEET",
    examName: "NEET UG 2025",
    rank: "AIR 412",
    selection: "Selected into MAMC New Delhi",
    score: "691 / 720",
    achievement: "Cleared NEET in the first attempt with rigorous self-study.",
    year: "2025",
  },
  {
    id: "ishita-joshi",
    name: "Ishita Joshi",
    initials: "IJ",
    category: "Olympiad",
    examName: "Indian National Chemistry Olympiad 2025",
    rank: "Gold Medalist",
    selection: "Selected into IIT Bombay Chemical Engg.",
    score: "Top 1% Nationally",
    achievement: "Mentored juniors while preparing for finals.",
    year: "2025",
  },
];

/**
 * Bottom summary stats. Data-driven for the same reason as RESULTS_DATA.
 */
export const RESULTS_STATS: ResultStat[] = [
  { id: "selections", label: "Selections", value: "5000+", icon: Trophy },
  { id: "iit", label: "IIT", value: "1200+", icon: GraduationCap },
  { id: "nit", label: "NIT", value: "2300+", icon: Building2 },
  { id: "aiims", label: "AIIMS", value: "450+", icon: HeartPulse },
  { id: "success-rate", label: "Success Rate", value: "98%", icon: TrendingUp },
];