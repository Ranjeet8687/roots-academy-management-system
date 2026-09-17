import { SectionWrapper } from "@/components/layout";
import { AboutImage } from "./AboutImage";
import { AboutContent } from "./AboutContent";

/**
 * About
 * Two-column section (image left, content right) using the shared
 * SectionWrapper for vertical rhythm/background. Composition only —
 * image, badge, heading, founders, features and CTA each live in their own
 * component.
 */
export function About() {
  return (
    <SectionWrapper
      id="about"
      background="bg-background"
    >
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <AboutImage />
        <AboutContent />
      </div>
    </SectionWrapper>
  );
}