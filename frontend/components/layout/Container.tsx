import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends PropsWithChildren {
  /** Additional classes merged onto the container */
  className?: string;
}

/**
 * Container
 * Centers content and caps it at the design system's max content
 * width (1280px), with responsive horizontal padding.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}