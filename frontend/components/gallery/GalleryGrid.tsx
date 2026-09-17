"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { GalleryCard } from "./GalleryCard";
import type { GalleryGridProps } from "./gallery.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/**
 * GalleryGrid
 * Responsive masonry-style layout built with CSS multi-column:
 * 1 column mobile, 2 columns tablet, 4 columns desktop. Takes
 * `items` as a prop rather than importing data directly, keeping
 * it reusable for any future filtered gallery view (e.g. by
 * category).
 */
export function GalleryGrid({ items, className }: GalleryGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      role="list"
      aria-label="Campus gallery"
      className={cn("columns-1 gap-6 sm:columns-2 lg:columns-4", className)}
    >
      {items.map((item, index) => (
        <div key={item.id} role="listitem" className="mb-6 inline-block w-full break-inside-avoid">
          <GalleryCard item={item} index={index} />
        </div>
      ))}
    </motion.div>
  );
}