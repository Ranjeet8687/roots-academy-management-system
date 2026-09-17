"use client";

import { motion, type Variants } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ContactIconName,
  SocialPlatform,
  ContactInfoProps,
} from "./contact.types";

/**
 * Custom social icons because lucide-react no longer ships
 * brand icons.
 */

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
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
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

const DETAIL_ICONS: Record<ContactIconName, LucideIcon> = {
  MapPin,
  Phone,
  Mail,
  Clock,
};

const SOCIAL_ICONS: Record<
  SocialPlatform,
  React.ComponentType<LucideProps>
> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  Linkedin: LinkedinIcon,
  Youtube: YoutubeIcon,
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function ContactInfo({
  details,
  socialLinks,
  className,
}: ContactInfoProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={cn(
        "flex flex-col gap-8 rounded-[var(--radius-lg)] p-8",
        className
      )}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <motion.h3
        variants={fadeUp}
        className="text-[18px] font-semibold"
        style={{
          color: "var(--color-text-primary)",
        }}
      >
        Contact Information
      </motion.h3>

      <dl className="flex flex-col gap-5">
        {details.map((detail) => {
          const Icon = DETAIL_ICONS[detail.icon];

          return (
            <motion.div
              key={detail.id}
              variants={fadeUp}
              className="flex items-start gap-4"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                style={{
                  backgroundColor: "var(--color-background)",
                }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: "var(--color-primary)",
                  }}
                />
              </span>

              <div className="flex flex-col gap-1">
                <dt
                  className="text-[13px] font-medium"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  {detail.label}
                </dt>

                <dd
                  className="text-[14px] leading-[22px]"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {detail.value}
                </dd>
              </div>
            </motion.div>
          );
        })}
      </dl>

      <motion.div
        variants={fadeUp}
        className="flex flex-col gap-3 pt-4"
        style={{
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span
          className="text-[13px] font-medium"
          style={{
            color: "var(--color-text-muted)",
          }}
        >
          Follow Us
        </span>

        <div className="flex items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = SOCIAL_ICONS[social.platform];

            return (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
                className={cn(
                  "group flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]",
                  "transition-colors duration-200 hover:bg-[var(--color-primary)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                )}
                style={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Icon
                  className="h-4 w-4 transition-colors duration-200 group-hover:text-white"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                />
              </a>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}