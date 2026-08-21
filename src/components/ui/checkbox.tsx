"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <span className="relative inline-flex h-5 w-5 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className={cn(
          "peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-line bg-raise transition-colors checked:border-teal checked:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-soft disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
    </span>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
