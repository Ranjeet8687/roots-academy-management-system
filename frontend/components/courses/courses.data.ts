import {
  Atom,
  HeartPulse,
  BookOpen,
  GraduationCap,
  Zap,
  RefreshCw,
} from "lucide-react";

import type { CourseData } from "./courses.types";

export const courses: CourseData[] = [
  {
    id: "jee-main-advanced",
    title: "JEE (Main & Advanced)",
    slug: "jee-main-advanced",

    description:
      "Comprehensive coaching for JEE Main and Advanced with conceptual learning, rigorous practice and regular performance evaluation.",

    duration: "2 Years",
    mode: "Offline",
    icon: Atom,
    badge: "Popular",

    features: [
      "Expert Physics, Chemistry & Mathematics faculty",
      "Weekly test series",
      "Small batch size",
      "Personalized doubt solving",
    ],
  },

  {
    id: "neet-ug",
    title: "NEET (UG)",
    slug: "neet-ug",

    description:
      "Complete NEET preparation focused on NCERT concepts, Biology mastery, test practice and medical entrance success.",

    duration: "2 Years",
    mode: "Offline",
    icon: HeartPulse,
    badge: "Popular",

    features: [
      "Biology-first learning",
      "Regular mock tests",
      "NCERT-based curriculum",
      "Personal mentoring",
    ],
  },

  {
    id: "foundation",
    title: "Foundation (Class 6–10)",
    slug: "foundation",

    description:
      "Early concept building for students of Classes 6–10 to prepare for Olympiads, Boards and future competitive examinations.",

    duration: "Class-wise Program",
    mode: "Offline",
    icon: BookOpen,
    badge: "Foundation",

    features: [
      "Concept building",
      "Mathematics & Science fundamentals",
      "Weekly assessments",
      "Interactive classrooms",
    ],
  },

  {
    id: "mht-cet",
    title: "MHT-CET",
    slug: "mht-cet",

    description:
      "Focused preparation for Maharashtra Common Entrance Test with structured study plans and exam-oriented practice.",

    duration: "1 Year / 2 Years",
    mode: "Offline",
    icon: GraduationCap,
    badge: "New",

    features: [
      "Topic-wise preparation",
      "Mock examinations",
      "Performance analysis",
      "Doubt sessions",
    ],
  },

  {
    id: "crash-course",
    title: "JEE / NEET Crash Course",
    slug: "crash-course",

    description:
      "High-intensity revision course covering complete syllabus, important concepts, previous year questions and test practice.",

    duration: "3–6 Months",
    mode: "Offline",
    icon: Zap,
    badge: "Fast Track",

    features: [
      "Complete revision",
      "Daily practice papers",
      "Previous year questions",
      "Final exam strategy",
    ],
  },

  {
    id: "dropper-batch",
    title: "JEE / NEET Dropper Batch",
    slug: "dropper-batch",

    description:
      "Dedicated one-year repeaters batch with personalized mentoring, complete syllabus coverage and continuous performance tracking.",

    duration: "1 Year",
    mode: "Offline",
    icon: RefreshCw,
    badge: "Premium",

    features: [
      "Personalized mentorship",
      "Full syllabus coverage",
      "Weekly mock tests",
      "Performance monitoring",
    ],
  },
];