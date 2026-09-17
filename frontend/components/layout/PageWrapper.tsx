import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export interface PageWrapperProps extends PropsWithChildren {
  /** Background token/class, e.g. "bg-background" or "bg-surface" */
  background?: string;
  /** Additional classes merged onto the wrapper */
  className?: string;
}

/**
 * PageWrapper
 * Top-level shell for every route. Guarantees full-viewport
 * height and a consistent background, independent of whatever
 * sections are rendered inside it.
 */
export function PageWrapper({
  children,
  background = "bg-background",
  className,
}: PageWrapperProps) {
  return (
    <div className={cn("min-h-screen w-full", background, className)}>
      {children}
    </div>
  );
}