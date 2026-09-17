"use client";

import { SectionWrapper } from "@/components/layout";
import { TestimonialsHeader } from "./TestimonialsHeader";
import { TestimonialsGrid } from "./TestimonialsGrid";
import { TESTIMONIALS_DATA } from "./testimonials.data";

/**
 * Testimonials
 * Full "Success Stories" section: header plus the testimonials
 * grid/carousel. Uses SectionWrapper (id="testimonials") for
 * consistent vertical rhythm/background and to support smooth
 * scroll + active-nav highlighting. Composition only — header and
 * grid each live in their own component.
 */
export function Testimonials() {
  return (
    <SectionWrapper id="testimonials" background="bg-surface">
      <div className="flex flex-col gap-14">
        <TestimonialsHeader />
        <TestimonialsGrid testimonials={TESTIMONIALS_DATA} />
      </div>
    </SectionWrapper>
  );
}