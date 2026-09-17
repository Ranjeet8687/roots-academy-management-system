import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

export interface SectionWrapperProps extends PropsWithChildren {
  /** HTML id used for in-page navigation */
  id?: string;

  /** Background token/class, e.g. "bg-background" or "bg-surface" */
  background?: string;

  /** Additional classes merged onto the outer <section> */
  className?: string;

  /** Additional classes merged onto the inner Container */
  containerClassName?: string;
}

/**
 * SectionWrapper
 * Governs vertical rhythm and background for a page section.
 * Wraps Container internally so width and vertical spacing
 * are never controlled by the same element.
 */
export function SectionWrapper({
  id,
  children,
  background = "bg-background",
  className,
  containerClassName,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("w-full py-16 md:py-24", background, className)}
    >
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}