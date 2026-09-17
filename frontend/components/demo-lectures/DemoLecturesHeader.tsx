"use client";

import { motion } from "framer-motion";

interface DemoLecturesHeaderProps {
  badgeLabel: string;
  heading: string;
  description: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function DemoLecturesHeader({ badgeLabel, heading, description }: DemoLecturesHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.1 }}
      className="max-w-2xl mx-auto text-center mb-10 md:mb-14"
    >
      <motion.p
        variants={itemVariants}
        className="text-sm font-semibold tracking-wide uppercase text-primary mb-3"
      >
        {badgeLabel}
      </motion.p>
      <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
        {heading}
      </motion.h2>
      <motion.p variants={itemVariants} className="text-muted-foreground leading-relaxed">
        {description}
      </motion.p>
    </motion.div>
  );
}