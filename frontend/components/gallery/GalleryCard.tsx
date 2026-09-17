"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GalleryCardProps } from "./gallery.types";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const overlayVariants: Variants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

const textVariants: Variants = {
  rest: { opacity: 0, y: 10 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const imageVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.5, ease: "easeOut" } },
};

/** Deterministic aspect-ratio variety for a masonry-style layout */
const ASPECT_RATIOS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]"] as const;

/** Placeholder blur data URL for missing images */
const PLACEHOLDER_BLUR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * GalleryCard
 * Single gallery tile: image with zoom-on-hover, a gradient overlay
 * that fades in, and a title/category that slides up into view.
 * Takes `item` + `index` as props so it stays reusable outside
 * GalleryGrid if ever needed (e.g. a "featured" spotlight tile).
 * Handles missing images gracefully with a clean placeholder.
 */
export function GalleryCard({ item, index = 0, className }: GalleryCardProps) {
  const aspectRatio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
  const hasImage = item.image && item.image.trim() !== "";

  return (
    <motion.figure
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: (index % 4) * 0.08 }}
      whileHover="hover"
      tabIndex={0}
      className={cn(
        "group relative w-full overflow-hidden rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        aspectRatio,
        className
      )}
      style={{ border: "1px solid var(--color-border)" }}
    >
      <motion.div variants={imageVariants} initial="rest" className="relative h-full w-full">
        {hasImage ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: "var(--color-primary-100)" }}>
            <div className="text-center p-4" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-[14px] font-medium">{item.title}</div>
              <div className="text-[11px] mt-1 opacity-70">Image not available</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Gradient overlay */}
      <motion.div
        variants={overlayVariants}
        initial="rest"
        aria-hidden="true"
        className="absolute inset-0 flex flex-col justify-end p-4"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.85) 100%)",
        }}
      >
        <motion.div variants={textVariants} initial="rest" className="flex flex-col gap-1">
          <span
            className="w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.03em]"
            style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
          >
            {item.category}
          </span>
          <figcaption className="text-[15px] font-semibold leading-tight text-white">
            {item.title}
          </figcaption>
        </motion.div>
      </motion.div>
    </motion.figure>
  );
}