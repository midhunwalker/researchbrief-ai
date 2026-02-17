"use client";

import React from "react";
import { Card } from "./ui/Card";
import { Brief } from "@/lib/types";

interface SourcesPanelProps {
  sources: Brief["sources"];
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-neutral-900">
        Sources ({sources.length})
      </h3>

      <div className="space-y-2">
        {sources.map((source, index) => (
          <Card key={index} variant="default">
            <div className="space-y-2">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-accent hover:text-accent-dark underline break-all"
              >
                <span className="font-medium">{source.title || source.url}</span>
              </a>

              {source.snippet && (
                <p className="text-sm text-neutral-600 italic">
                  &ldquo;{source.snippet}&rdquo;
                </p>
              )}

              <p className="text-xs text-neutral-500 break-all">{source.url}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
