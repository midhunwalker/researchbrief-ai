"use client";

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random()}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-2 focus:ring-accent-light cursor-pointer"
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-neutral-900 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
