"use client";

import React from "react";
import { Card } from "./ui/Card";
import { Brief } from "@/lib/types";

interface BriefSummaryProps {
  brief: Brief;
  onSave?: () => void;
  onExportPdf?: () => void;
  onCopyText?: () => void;
  isSaved?: boolean;
  loading?: boolean;
}

export const BriefSummary: React.FC<BriefSummaryProps> = ({
  brief,
  onSave,
  onExportPdf,
  onCopyText,
  isSaved = false,
  loading = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyText?.();
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card variant="elevated">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{brief.title}</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Created {new Date(brief.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {onSave && !isSaved && (
            <button
              onClick={onSave}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          )}
          {isSaved && (
            <span className="px-3 py-2 text-sm font-medium bg-green-100 text-green-900 rounded-lg">
              ✓ Saved
            </span>
          )}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-3 py-2 text-sm font-medium border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50"
            >
              Export PDF
            </button>
          )}
          {onCopyText && (
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-sm font-medium border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
          {brief.summary}
        </p>
      </div>
    </Card>
  );
};
