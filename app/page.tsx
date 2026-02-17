"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { InputUrlBlock } from "./components/InputUrlBlock";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { RecentBriefs } from "./components/RecentBriefs";
import { generateBrief, getSavedBriefs } from "@/lib/api";
import { Brief } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [recentBriefs, setRecentBriefs] = React.useState<Brief[]>([]);

  React.useEffect(() => {
    const loadRecentBriefs = async () => {
      try {
        const briefs = await getSavedBriefs();
        setRecentBriefs(briefs);
      } catch (err) {
        console.error("Failed to load recent briefs:", err);
      }
    };
    loadRecentBriefs();
  }, []);

  const handleGenerateBrief = async (urls: string[]) => {
    setLoading(true);
    setCurrentStep(0);

    const steps = [
      "Fetching sources…",
      "Cleaning & extracting…",
      "Analyzing…",
      "Generating brief…",
    ];

    let stepInterval: NodeJS.Timeout | undefined;

    try {
      // Simulate progress through steps
      stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 800);

      const response = await generateBrief(urls);

      clearInterval(stepInterval);
      setLoading(false);

      // Reload recent briefs
      try {
        const briefs = await getSavedBriefs();
        setRecentBriefs(briefs);
      } catch (err) {
        console.error("Failed to reload briefs:", err);
      }

      // Navigate to the new brief
      router.push(`/brief/${response.id}`);
    } catch (error) {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
      setLoading(false);
      console.error("Error generating brief:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="py-8">
      <LoadingOverlay isVisible={loading} currentStep={currentStep} />

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
            Research Brief Generator
          </h1>
          <p className="text-lg text-neutral-600">
            Analyze multiple URLs and generate comprehensive research briefs with AI
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg p-6 md:p-8 border border-neutral-200">
          <InputUrlBlock
            onSubmit={handleGenerateBrief}
            loading={loading}
          />
        </div>

        {/* Recent Briefs Section */}
        {recentBriefs.length > 0 && (
          <div>
            <RecentBriefs briefs={recentBriefs} />
          </div>
        )}
      </div>
    </div>
  );
}
