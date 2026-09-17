"use client";

import { SectionWrapper } from "@/components/layout";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsGrid } from "./ResultsGrid";
import { ResultStats } from "./ResultStats";
import { RESULTS_DATA, RESULTS_STATS } from "./results.data";

/**
 * Results
 * Full "Top Results" section: header, result card grid, and the
 * bottom summary stats row. Uses SectionWrapper for consistent
 * vertical rhythm/background. Composition only — header, grid, and
 * stats each live in their own component.
 */
export function Results() {
  return (
    <SectionWrapper id="results"
      background="bg-background">
      <div className="flex flex-col gap-14">
        <ResultsHeader />
        <ResultsGrid results={RESULTS_DATA} />
        <ResultStats stats={RESULTS_STATS} />
      </div>
    </SectionWrapper>
  );
}