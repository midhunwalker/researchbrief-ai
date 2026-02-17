"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedBriefs } from "@/lib/api";
import { Brief } from "@/lib/types";
import { Card } from "@/app/components/ui/Card";
import { formatDate } from "@/lib/api";

export default function SavedPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadBriefs = async () => {
      try {
        setLoading(true);
        const data = await getSavedBriefs();
        const saved = data.filter((b) => b.saved_at);
        setBriefs(saved.reverse());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load briefs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBriefs();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-neutral-600">Loading saved briefs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Saved Briefs</h1>
        <p className="text-neutral-600 mb-8">
          All your saved research briefs
        </p>

        {error && (
          <Card variant="elevated" className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {briefs.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <p className="text-neutral-600 mb-4">
              No saved briefs yet. Create and save your first brief!
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
            >
              Generate a Brief
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {briefs.map((brief) => (
              <Link key={brief.id} href={`/brief/${brief.id}`}>
                <Card
                  variant="elevated"
                  className="hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {brief.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-2">
                        Created: {formatDate(brief.created_at)}
                      </p>
                      {brief.saved_at && (
                        <p className="text-sm text-neutral-600">
                          Saved: {formatDate(brief.saved_at)}
                        </p>
                      )}
                      <p className="text-sm text-neutral-500 mt-2">
                        {brief.key_points.length} key points •{" "}
                        {brief.conflicts.length} conflicts •{" "}
                        {brief.sources.length} sources
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-accent-light text-accent-dark text-xs font-semibold rounded-full">
                        {brief.sources.length} sources
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
