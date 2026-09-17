import type { Testimonial } from "./testimonials.types";

export const TESTIMONIALS_LABEL = "SUCCESS STORIES" as const;

export const TESTIMONIALS_HEADING = "What Students & Parents Say" as const;

export const TESTIMONIALS_DESCRIPTION =
  "Trusted by thousands of students and parents across India." as const;

/**
 * Real testimonials collected from students. Identities are
 * anonymized (no names/photos were provided), so each entry uses a
 * course-based label instead of a fabricated name or rating.
 */
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "testimonial-1",
    label: "JEE Main Student",
    course: "JEE Main Batch",
    review:
      "Roots Academy changed the way I approach Physics & Mathematics. The concept-focused teaching & regular tests built my confidence to score high in JEE Main.",
  },
  {
    id: "testimonial-2",
    label: "NEET Student",
    course: "NEET UG Batch",
    review:
      "The faculty members are incredibly supportive. The personal doubt-solving sessions helped me clear my basic concepts & excel in NEET.",
  },
  {
    id: "testimonial-3",
    label: "Foundation Student",
    course: "Foundation Batch (6–10)",
    review:
      "Joining the foundation batch early gave me a big advantage. The structured curriculum & problem-solving techniques made complex topics easy to understand.",
  },
  {
    id: "testimonial-4",
    label: "JEE / NEET Student",
    course: "JEE / NEET Batch",
    review:
      "The study material & test series strictly align with the latest exam patterns. The individual attention provided here makes a big difference.",
  },
  {
    id: "testimonial-5",
    label: "Competitive Exam Student",
    course: "JEE / NEET Batch",
    review:
      "Roots Academy offers a great learning environment with approachable mentors who keep you motivated throughout the competitive exam journey.",
  },
];