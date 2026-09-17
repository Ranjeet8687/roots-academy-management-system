import { Container } from "@/components/layout/Container";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";

/**
 * Hero
 * Top-of-page section. Full-bleed animated background with a
 * two-column layout (copy left, visual right) that stacks on
 * mobile. Composition only — content, stats, and visuals each
 * live in their own component.
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden"
    >
      <HeroBackground />

      <Container>
        <div className="grid grid-cols-1 items-center gap-12 pt-20 pb-16 lg:grid-cols-2 lg:gap-16 lg:pt-28 lg:pb-24">
          <HeroContent />
          <HeroVisual className="order-first lg:order-last" />
        </div>
      </Container>
    </section>
  );
}