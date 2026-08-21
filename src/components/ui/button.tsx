import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13.5px] font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary: "bg-ink text-bg hover:opacity-90",
        accent: "bg-amber text-white hover:opacity-90",
        secondary: "bg-surface-2 text-ink border border-line hover:bg-surface",
        ghost: "text-ink hover:bg-surface-2",
        outline: "border border-line text-ink hover:bg-surface-2",
        destructive: "bg-mahogany text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-[12.5px]",
        default: "h-10 px-4",
        lg: "h-11 px-5 text-[14px]",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
