import { DemoLecturesHeader } from "./DemoLecturesHeader";
import { DemoLecturesGrid } from "./DemoLecturesGrid";
import { demoLectures } from "./demo-lectures.data";
import type { DemoLectureCategory } from "./demo-lectures.types";

const CATEGORIES: DemoLectureCategory[] = ["JEE", "NEET", "Foundation", "MHT CET", "Dropper"];

/**
 * Composition root for the Demo Lectures section. Only this file (or
 * index.ts) should be imported elsewhere — typically on the Home page.
 *
 * Public section — no login required. Data is static for now
 * (demo-lectures.data.ts) and will later be replaced by a server-fetched
 * GET /api/v1/demo-lectures response (populated via Admin/Faculty
 * dashboard uploads) — DemoLecturesGrid/Card/Modal require no changes
 * when that happens. Premium/full lectures are intentionally out of
 * scope for this module and belong to the authenticated Student Dashboard.
 */
export function DemoLectures() {
  return (
    <section id="demo-lectures" className="py-16 md:py-24 bg-muted/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DemoLecturesHeader
          badgeLabel="Free Demo Lectures"
          heading="Experience Our Teaching Before Admission"
          description="Watch free sample lectures from our expert faculty and understand our teaching methodology before enrolling."
        />

        <DemoLecturesGrid lectures={demoLectures} categories={CATEGORIES} />
      </div>
    </section>
  );
}