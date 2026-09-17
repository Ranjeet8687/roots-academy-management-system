
import {
  Users,
  ClipboardCheck,
  MessagesSquare,
  FileText,
  BookOpen,
  HeartHandshake,
} from "lucide-react";
import type { WhyChooseFeature } from "./whyChoose.types";

export const WHY_CHOOSE_LABEL = "Why Choose Roots Academy" as const;

export const WHY_CHOOSE_HEADING = "Excellence That Drives Success" as const;

export const WHY_CHOOSE_DESCRIPTION =
  "Focused learning, expert guidance, and personal mentorship to help every student achieve their goals." as const;

/**
 * Key features that make Roots Academy a strong choice
 * for JEE, NEET, and Foundation students.
 */
export const WHY_CHOOSE_FEATURES: WhyChooseFeature[] = [
  {
    id: "small-batch-size",
    title: "Small Batch Size",
    description: "Focused classrooms with individual attention for every student.",
    icon: Users,
  },
  {
    id: "experienced-faculty",
    title: "Experienced Faculty",
    description: "Expert guidance to build strong concepts and confidence.",
    icon: HeartHandshake,
  },
  {
    id: "weekly-tests",
    title: "Regular Assessments",
    description: "Practice tests to track progress and improve performance.",
    icon: ClipboardCheck,
  },
  {
    id: "doubt-sessions",
    title: "Doubt Sessions",
    description: "Dedicated support to clear concepts and solve doubts.",
    icon: MessagesSquare,
  },
  {
    id: "study-resources",
    title: "Study Resources",
    description: "Organized notes and practice material for better learning.",
    icon: FileText,
  },
  {
    id: "personal-mentorship",
    title: "Personal Mentorship",
    description: "Individual guidance to help students reach their goals.",
    icon: BookOpen,
  },
];