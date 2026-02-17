"use client";

import React from "react";
import Link from "next/link";
import { Card } from "./ui/Card";
import { Brief } from "@/lib/types";
import { formatDate } from "@/lib/api";

interface RecentBriefsProps {
  briefs: Brief[];
}

export const RecentBriefs: React.FC<RecentBriefsProps> = ({ briefs }) => {
  if (briefs.length === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <p className="text-neutral-500 text-center">
          No briefs yet. Create your first brief above!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-neutral-900">Recent Briefs</h3>
      {briefs.map((brief) => (
        <Link
          key={brief.id}
          href={`/brief/${brief.id}`}
          className="block"
        >
          <Card variant="elevated" className="hover:shadow-lg transition cursor-pointer">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-900 truncate">
                  {brief.title}
                </h4>
                <p className="text-sm text-neutral-500 mt-1">
                  {formatDate(brief.created_at)}
                </p>
              </div>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded whitespace-nowrap">
                {brief.sources.length} sources
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
