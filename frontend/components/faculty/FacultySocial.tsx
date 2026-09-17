"use client";

import { User, Mail, Globe } from "lucide-react";
import type { FacultySocialLinks } from "./faculty.types";

export interface FacultySocialProps {
  links: FacultySocialLinks;
  facultyName: string;
}   

/**
 * FacultySocial
 * Displays only the social icons that exist for a faculty member.
 */
export function FacultySocial({
  links,
  facultyName,
}: FacultySocialProps) {
  const items = [
    links.linkedin && {
      key: "linkedin",
      href: links.linkedin,
      label: `${facultyName} on LinkedIn`,
      Icon: User,
    },
    links.email && {
      key: "email",
      href: `mailto:${links.email}`,
      label: `Email ${facultyName}`,
      Icon: Mail,
    },
    links.website && {
      key: "website",
      href: links.website,
      label: `${facultyName}'s Website`,
      Icon: Globe,
    },
  ].filter(Boolean) as {
    key: string;
    href: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[];

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {items.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={label}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-background)]
            text-[var(--color-text-secondary)]
            transition-all duration-300
            hover:border-[var(--color-primary)]
            hover:bg-[var(--color-primary)]
            hover:text-white
            hover:-translate-y-1
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[var(--color-primary)]
          "
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}