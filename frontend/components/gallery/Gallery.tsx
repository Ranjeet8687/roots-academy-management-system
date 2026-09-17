"use client";

import { SectionWrapper } from "@/components/layout";
import { GalleryHeader } from "./GalleryHeader";
import { GalleryGrid } from "./GalleryGrid";
import { GALLERY_DATA } from "./gallery.data";

/**
 * Gallery
 * Full "Campus Life" section: header plus the masonry gallery grid.
 * Uses SectionWrapper (id="gallery") for consistent vertical
 * rhythm/background and to support smooth scroll + active-nav
 * highlighting. Composition only — header and grid each live in
 * their own component.
 */
export function Gallery() {
  return (
    <SectionWrapper id="gallery" background="bg-background">
      <div className="flex flex-col gap-14">
        <GalleryHeader />
        <GalleryGrid items={GALLERY_DATA} />
      </div>
    </SectionWrapper>
  );
}