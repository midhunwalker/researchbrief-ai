"use client";

import React from "react";
import { Spinner } from "./ui/Spinner";

interface LoadingOverlayProps {
  isVisible: boolean;
  currentStep?: number;
  steps?: string[];
}

const defaultSteps = [
  "Fetching sources…",
  "Cleaning & extracting…",
  "Analyzing…",
  "Generating brief…",
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  currentStep = 0,
  steps = defaultSteps,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <Spinner />
          
          <div className="w-full">
            <h3 className="text-lg font-semibold text-center mb-4">
              Processing Your Brief
            </h3>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {index < currentStep ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : index === currentStep ? (
                      <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      index <= currentStep
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            This may take a few moments...
          </p>
        </div>
      </div>
    </div>
  );
};
