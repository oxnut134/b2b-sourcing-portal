import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tracking-wide ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-indigo-500/12 text-indigo-300 ring-indigo-500/30",
        secondary:   "bg-[#2d3c52] text-[#94a3b8] ring-[rgba(148,163,184,0.18)]",
        destructive: "bg-rose-500/12 text-rose-300 ring-rose-500/30",
        success:     "bg-emerald-500/12 text-emerald-300 ring-emerald-500/30",
        warning:     "bg-amber-500/12 text-amber-300 ring-amber-500/30",
        info:        "bg-cyan-500/12 text-cyan-300 ring-cyan-500/30",
        violet:      "bg-violet-500/12 text-violet-300 ring-violet-500/30",
        outline:     "bg-transparent text-[#94a3b8] ring-[rgba(148,163,184,0.28)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
