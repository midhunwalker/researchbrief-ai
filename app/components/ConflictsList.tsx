"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Brief } from "@/lib/types";

interface ConflictsListProps {
  conflicts: Brief["conflicts"];
}

export const ConflictsList: React.FC<ConflictsListProps> = ({ conflicts }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-neutral-900">
        Conflicting Claims
      </h3>
      {conflicts.map((conflict) => (
        <Card
          key={conflict.id}
          variant="elevated"
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() =>
            setExpanded(expanded === conflict.id ? null : conflict.id)
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-900">
                Conflicting Claim {conflicts.indexOf(conflict) + 1}
              </h4>
              <svg
                className={`w-5 h-5 text-neutral-500 transition-transform ${
                  expanded === conflict.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>

            {expanded === conflict.id && (
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Claim A
                  </p>
                  <p className="text-neutral-700">{conflict.claimA.text}</p>
                  <a
                    href={conflict.claimA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-dark underline break-all inline-block"
                  >
                    {conflict.claimA.url}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-neutral-200"></div>
                  <span className="text-xs font-semibold text-neutral-600">VS</span>
                  <div className="flex-1 h-px bg-neutral-200"></div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Claim B
                  </p>
                  <p className="text-neutral-700">{conflict.claimB.text}</p>
                  <a
                    href={conflict.claimB.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-dark underline break-all inline-block"
                  >
                    {conflict.claimB.url}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
