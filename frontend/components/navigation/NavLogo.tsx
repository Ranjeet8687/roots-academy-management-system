
"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_NAME, BRAND_TAGLINE } from "./navigation.data";

export interface NavLogoProps {
  className?: string;
  variant?: "default" | "compact" | "footer";
}

export function NavLogo({
  className,
  variant = "default",
}: NavLogoProps) {
  const isCompact = variant === "compact";
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} — go to homepage`}
      className={cn(
        "flex items-center gap-3 shrink-0",
        "transition-opacity duration-200 hover:opacity-80",
        className
      )}
    >
      {/* Full JEE NEET logo - responsive sizing */}
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          isCompact
            ? "h-8 w-16 sm:h-10 sm:w-20"
            : isFooter
              ? "h-16 w-32"
              : "h-10 w-20 sm:h-14 sm:w-28"
        )}
      >
        <Image
          src="/roots-academy-logo.png"
          alt="Roots Academy JEE NEET Logo"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 640px) 64px, 112px"
        />
      </span>

      {/* Branding text container - allows truncation on small screens */}
      <div className="min-w-0 flex flex-col leading-tight overflow-hidden">
        <span
          className={cn(
            "font-semibold tracking-[-0.01em] truncate",
            isCompact && "text-[14px] sm:text-[15px]",
            !isCompact && !isFooter && "text-[15px] sm:text-[17px]",
            isFooter && "text-[18px]"
          )}
          style={{ color: "var(--color-text-primary)" }}
        >
          {BRAND_NAME}
        </span>

        {!isCompact && (
          <span
            className={cn(
              "font-medium tracking-wide uppercase truncate",
              !isFooter && "text-[9px] sm:text-[10px]",
              isFooter && "text-[11px]"
            )}
            style={{ color: "var(--color-primary)" }}
          >
            {BRAND_TAGLINE}
          </span>
        )}
      </div>
    </Link>
  );
}