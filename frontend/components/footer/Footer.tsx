"use client";

import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/layout";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { FooterBottom } from "./FooterBottom";
import {
  footerBrand,
  footerQuickLinks,
  footerCourses,
  footerContactDetails,
  footerSocialLinks,
  footerCopyright,
  footerBottomLinks,
} from "./footer.data";

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/**
 * Footer
 * Composes brand, links, and bottom bar. No business logic here.
 */
export function Footer() {
  return (
    <footer aria-label="Site footer" className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="flex flex-col gap-12 py-16 md:py-20"
        >
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            <FooterBrand brand={footerBrand} />
            <FooterLinks
              quickLinks={footerQuickLinks}
              courses={footerCourses}
              contactDetails={footerContactDetails}
              socialLinks={footerSocialLinks}
              className="lg:min-w-[560px]"
            />
          </div>

          <FooterBottom copyright={footerCopyright} bottomLinks={footerBottomLinks} />
        </motion.div>
      </Container>
    </footer>
  );
}