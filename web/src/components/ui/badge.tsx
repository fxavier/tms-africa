import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white",
        secondary: "bg-slate-100 text-slate-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-orange-100 text-orange-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
