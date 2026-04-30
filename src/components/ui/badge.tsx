import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning:
          "border-transparent bg-warning/15 text-warning border-warning/20",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        gradient:
          "border-transparent bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-fuchsia-500/15 text-violet-700 dark:text-violet-300",
        hot: "border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-300",
        instant:
          "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
        limited:
          "border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-300",
        wholesale:
          "border-transparent bg-violet-500/15 text-violet-600 dark:text-violet-300",
        new: "border-transparent bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
