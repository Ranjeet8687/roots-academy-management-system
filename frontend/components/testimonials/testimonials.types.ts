export interface Testimonial {
  id: string;
  /** Anonymized identity, e.g. "JEE Main Student" — no real names available */
  label: string;
  /** e.g. "JEE Main Batch" */
  course: string;
  review: string;
}

export interface TestimonialsHeaderProps {
  className?: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  /** Index within the grid, used to stagger the reveal delay */
  index?: number;
  className?: string;
}

export interface TestimonialsGridProps {
  testimonials: Testimonial[];
  className?: string;
}