"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", ...props }, ref) => {
    const variantClasses = {
      default: "border border-neutral-200",
      elevated: "shadow-md",
    };

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg p-4 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
