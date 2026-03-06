"use client";

import * as React from "react";

import { cn } from "@/app/lib/utils";

type BackgroundGradientProps = React.HTMLAttributes<HTMLDivElement> & {
  containerClassName?: string;
  animate?: boolean;
};

const BackgroundGradient = React.forwardRef<HTMLDivElement, BackgroundGradientProps>(
  ({ className, containerClassName, animate = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group relative rounded-[22px] p-[1px]", containerClassName)}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_rgba(255,255,255,0)_55%)] opacity-40 blur-lg transition duration-500 group-hover:opacity-70",
            animate && "animate-pulse"
          )}
        />
        <div className={cn("relative rounded-[22px] bg-black/40", className)}>{children}</div>
      </div>
    );
  }
);

BackgroundGradient.displayName = "BackgroundGradient";

export { BackgroundGradient };
