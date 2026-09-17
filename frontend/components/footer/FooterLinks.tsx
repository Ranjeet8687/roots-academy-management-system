"use client";
import type { ComponentType } from "react";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Send, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FooterLinksProps, SocialPlatform } from "./footer.types";

/* -------------------------------------------------------------------------- */
/*                          Custom Social Icons                               */
/* -------------------------------------------------------------------------- */

function FacebookIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 9V6.5A1.5 1.5 0 0 1 15.5 5H17V2h-2a4 4 0 0 0-4 4v3H8v3h3v9h3v-9h2.5l.5-3H14Z" />
    </svg>
  );
}

function InstagramIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.6"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function LinkedinIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5" />
      <circle cx="8" cy="8" r="0.6" fill="currentColor" stroke="none" />
      <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
      <path d="M12 11v5" />
    </svg>
  );
}

function YoutubeIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="m10 9 5 3-5 3Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

const socialIconMap: Record<
  SocialPlatform,
  ComponentType<LucideProps>
> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YoutubeIcon,
  Telegram: Send,
  LinkedIn: LinkedinIcon,
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * FooterLinks
 */
export function FooterLinks({
  quickLinks,
  courses,
  contactDetails,
  socialLinks,
  className,
}: FooterLinksProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {/* Quick Links */}
      <motion.nav variants={fadeUp} aria-label="Quick links">
        <h3 className="text-[var(--text-caption)] font-[var(--font-weight-semibold)] uppercase tracking-wide text-[var(--color-text-primary)]">
          Quick Links
        </h3>

        <ul className="mt-4 flex flex-col gap-2.5">
          {quickLinks.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className="rounded-[var(--radius-sm)] text-[var(--text-body)] text-[var(--color-text-secondary)] transition-colors duration-[var(--transition-base)] hover:text-[var(--color-primary)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Courses */}
      <motion.nav variants={fadeUp} aria-label="Courses">
        <h3 className="text-[var(--text-caption)] font-[var(--font-weight-semibold)] uppercase tracking-wide text-[var(--color-text-primary)]">
          Courses
        </h3>

        <ul className="mt-4 flex flex-col gap-2.5">
          {courses.map((course) => (
            <li
              key={course.id}
              className="text-[var(--text-body)] text-[var(--color-text-secondary)]"
            >
              {course.label}
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Contact */}
      <motion.div variants={fadeUp}>
        <h3 className="text-[var(--text-caption)] font-[var(--font-weight-semibold)] uppercase tracking-wide text-[var(--color-text-primary)]">
          Contact
        </h3>

        <ul
          className="mt-4 flex flex-col gap-2.5"
          aria-label="Contact details"
        >
          {contactDetails.map((detail) => (
            <li
              key={detail.id}
              className="text-[var(--text-body)] text-[var(--color-text-secondary)]"
            >
              <span className="text-[var(--color-text-muted)]">
                {detail.label}:{" "}
              </span>

              {detail.href ? (
                <Link
                  href={detail.href}
                  className="transition-colors hover:text-[var(--color-primary)]"
                >
                  {detail.value}
                </Link>
              ) : (
                <span>{detail.value}</span>
              )}
            </li>
          ))}
        </ul>

        <div
          className="mt-6 flex items-center gap-3"
          aria-label="Social links"
        >
          {socialLinks.map((social) => {
            const Icon = socialIconMap[social.platform];

            return (
              <Link
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] transition-colors duration-200 hover:bg-[var(--color-primary)] hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}