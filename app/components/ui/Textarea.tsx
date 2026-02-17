"use client";

import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-900 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-neutral-300 focus:ring-accent-light"
          }`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-red-600 text-sm mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-neutral-500 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
