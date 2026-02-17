"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { formatTime } from "@/lib/api";

interface HealthCheck {
  status: "ok" | "error" | "warning";
  message: string;
  checked_at: string;
}

interface StatusResponse {
  backend: HealthCheck;
  database: HealthCheck;
  llm: HealthCheck;
  timestamp: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/status");
        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (
    statusValue: "ok" | "error" | "warning"
  ): "success" | "error" | "warning" => {
    return statusValue === "ok" ? "success" : statusValue;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-neutral-600">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">System Status</h1>
        <p className="text-neutral-600 mb-8">Real-time health checks</p>

        {error && (
          <Card variant="elevated" className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {status && (
          <div className="space-y-4">
            {/* Backend */}
            <Card variant="elevated">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Backend</h3>
                  <p className="text-neutral-600 text-sm mt-1">
                    {status.backend.message}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Checked: {formatTime(status.backend.checked_at)}
                  </p>
                </div>
                <Badge variant={getStatusBadge(status.backend.status)}>
                  {status.backend.status.toUpperCase()}
                </Badge>
              </div>
            </Card>

            {/* Database */}
            <Card variant="elevated">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Database</h3>
                  <p className="text-neutral-600 text-sm mt-1">
                    {status.database.message}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Checked: {formatTime(status.database.checked_at)}
                  </p>
                </div>
                <Badge variant={getStatusBadge(status.database.status)}>
                  {status.database.status.toUpperCase()}
                </Badge>
              </div>
            </Card>

            {/* LLM */}
            <Card variant="elevated">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">LLM Service</h3>
                  <p className="text-neutral-600 text-sm mt-1">
                    {status.llm.message}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Checked: {formatTime(status.llm.checked_at)}
                  </p>
                </div>
                <Badge variant={getStatusBadge(status.llm.status)}>
                  {status.llm.status.toUpperCase()}
                </Badge>
              </div>
            </Card>

            <div className="pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                Last updated: {formatTime(status.timestamp)}
              </p>
              <p className="text-xs text-neutral-400 text-center mt-2">
                Status auto-refreshes every 30 seconds
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
