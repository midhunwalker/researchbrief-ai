"use client";

import React from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Brief } from "@/lib/types";

interface KeyPointsListProps {
  keyPoints: Brief["key_points"];
}

export const KeyPointsList: React.FC<KeyPointsListProps> = ({ keyPoints }) => {
  const credibilityColor = {
    low: "error",
    medium: "warning",
    high: "success",
  } as const;

  const credibilityLabel = {
    low: "Low credibility",
    medium: "Medium credibility",
    high: "High credibility",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-neutral-900">Key Points</h3>
      {keyPoints.map((point, index) => (
        <Card key={point.id} variant="elevated">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{point.text}</p>
                <Badge
                  variant={credibilityColor[point.credibility]}
                  size="sm"
                  className="mt-2"
                >
                  {credibilityLabel[point.credibility]}
                </Badge>
              </div>
            </div>

            {point.sources.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                  Sources
                </p>
                {point.sources.map((source, srcIndex) => (
                  <div key={srcIndex} className="space-y-1">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-dark underline break-all"
                    >
                      {source.url}
                    </a>
                    <p className="text-sm text-neutral-600 italic">
                      &ldquo;{source.snippet}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
