"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBrief, saveBrief } from "@/lib/api";
import { Brief } from "@/lib/types";
import { BriefSummary } from "@/app/components/BriefSummary";
import { KeyPointsList } from "@/app/components/KeyPointsList";
import { ConflictsList } from "@/app/components/ConflictsList";
import { VerifyChecklist } from "@/app/components/VerifyChecklist";
import { SourcesPanel } from "@/app/components/SourcesPanel";
import { Card } from "@/app/components/ui/Card";

interface PageProps {
  params: {
    id: string;
  };
}

export default function BriefPage({ params }: PageProps) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBrief = async () => {
      try {
        setLoading(true);
        const data = await getBrief(params.id);
        setBrief(data);
        setIsSaved(!!data.saved_at);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load brief"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBrief();
  }, [params.id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveBrief(params.id);
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save brief:", err);
      alert("Failed to save brief");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    // TODO: Implement PDF export
    alert("PDF export coming soon!");
  };

  const handleCopyText = () => {
    // Text copied
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin h-8 w-8 text-accent"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="mt-4 text-neutral-600">Loading brief...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="py-8">
        <Card variant="elevated" className="max-w-md mx-auto">
          <div className="text-center space-y-4">
            <p className="text-red-600 font-medium">{error || "Brief not found"}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
            >
              Back to Home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/"
        className="text-accent hover:text-accent-dark underline text-sm"
      >
        ← Back to Home
      </Link>

      {/* Summary */}
      <BriefSummary
        brief={brief}
        onSave={handleSave}
        onExportPdf={handleExportPdf}
        onCopyText={handleCopyText}
        isSaved={isSaved}
        loading={saving}
      />

      {/* Key Points */}
      <KeyPointsList keyPoints={brief.key_points} />

      {/* Conflicts */}
      <ConflictsList conflicts={brief.conflicts} />

      {/* What to Verify */}
      <VerifyChecklist items={brief.what_to_verify} />

      {/* Sources */}
      <SourcesPanel sources={brief.sources} />
    </div>
  );
}
