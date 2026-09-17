import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AuthIllustration } from "./AuthIllustration";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Shared two-column shell for all auth pages: brand mark + illustration
 * on desktop (never dominant), centered card slot on both. Mobile
 * stacks the brand mark above the card, illustration hidden entirely
 * to keep focus on the form.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-muted/30">
      <div className="hidden lg:flex flex-col justify-center px-12 relative overflow-hidden">
        <Link href="/" className="absolute top-8 left-12 flex items-center gap-2 font-semibold text-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
          Roots Academy
        </Link>
        <AuthIllustration />
      </div>

      <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-12 lg:py-0">
        <Link href="/" className="lg:hidden flex items-center gap-2 font-semibold text-lg mb-8">
          <GraduationCap className="h-6 w-6 text-primary" />
          Roots Academy
        </Link>
        {children}
      </div>
    </div>
  );
}