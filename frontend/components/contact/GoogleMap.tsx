"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { GOOGLE_MAP_TITLE, GOOGLE_MAP_EMBED_SRC } from "./contact.data";
import type { GoogleMapProps } from "./contact.types";

const mapVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * GoogleMap
 * Full-width embedded Google Map for the campus location. Title and
 * embed URL default to contact.data.ts constants but can be
 * overridden via props, keeping this reusable for any future
 * location (e.g. a second campus).
 */
export function GoogleMap({
  title = GOOGLE_MAP_TITLE,
  src = GOOGLE_MAP_EMBED_SRC,
  className,
}: GoogleMapProps) {
  return (
    <motion.div
      variants={mapVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={cn(
        "h-80 w-full overflow-hidden rounded-[var(--radius-lg)] sm:h-96 lg:h-[420px]",
        className
      )}
      style={{ border: "1px solid var(--color-border)" }}
    >
      <iframe
        src={src}
        title={title}
        aria-label={title}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </motion.div>
  );
}