"use client";

import { motion } from "framer-motion";

/**
 * Original, education-themed decorative illustration (no copied
 * assets/branding). Deliberately restrained in size and opacity so it
 * never competes with the AuthCard for attention.
 */
export function AuthIllustration() {
  return (
    <div className="hidden lg:flex items-center justify-center h-full w-full">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full max-w-sm text-primary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <circle cx="200" cy="200" r="160" fill="currentColor" opacity="0.06" />

        {/* Open book */}
        <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M120 240 L200 220 L200 150 L120 168 Z" fill="currentColor" opacity="0.85" />
          <path d="M280 240 L200 220 L200 150 L280 168 Z" fill="currentColor" opacity="0.65" />
          <line x1="200" y1="150" x2="200" y2="220" stroke="white" strokeWidth="2" opacity="0.4" />
        </motion.g>

        {/* Graduation cap */}
        <motion.g
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <path d="M200 90 L270 118 L200 146 L130 118 Z" fill="currentColor" />
          <rect x="196" y="118" width="8" height="34" fill="currentColor" opacity="0.7" />
        </motion.g>

        {/* Floating accent dots */}
        <motion.circle
          cx="90" cy="130" r="6" fill="currentColor" opacity="0.4"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="320" cy="270" r="8" fill="currentColor" opacity="0.3"
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.circle
          cx="310" cy="110" r="5" fill="currentColor" opacity="0.35"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}