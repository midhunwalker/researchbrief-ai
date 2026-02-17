"use client";

import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", className = "", ...props }, ref) => {
    const variantClasses = {
      default: "bg-neutral-200 text-neutral-900",
      success: "bg-green-100 text-green-900",
      warning: "bg-yellow-100 text-yellow-900",
      error: "bg-red-100 text-red-900",
      info: "bg-blue-100 text-blue-900",
    };

    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
    };

    return (
      <span
        ref={ref}
        className={`inline-block rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
