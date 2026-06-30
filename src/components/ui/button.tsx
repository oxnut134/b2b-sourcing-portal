import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1e] disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "btn-premium text-white",
        premium:
          "btn-premium text-white",
        secondary:
          "bg-[#131f34] text-[#94a3b8] border border-[rgba(148,163,184,0.12)] hover:bg-[#1a2e4a] hover:text-[#e2e8f0] hover:border-[rgba(148,163,184,0.2)] transition-all",
        outline:
          "border border-[rgba(148,163,184,0.14)] bg-transparent text-[#94a3b8] hover:bg-[#131f34] hover:text-[#e2e8f0] hover:border-[rgba(99,102,241,0.3)]",
        ghost:
          "text-[#64748b] hover:bg-[#131f34] hover:text-[#94a3b8]",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30",
        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300 shadow-none",
        cyan:
          "btn-cyan text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-7 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-xl px-6 text-[15px]",
        xl:      "h-13 rounded-xl px-8 text-base font-semibold",
        icon:    "h-9 w-9 shrink-0",
        "icon-sm": "h-7 w-7 rounded-md shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
