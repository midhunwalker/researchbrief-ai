/**
 * API route: GET /api/status
 *
 * Health check endpoint that verifies:
 * - Backend is running
 * - Database is accessible
 * - LLM (Groq) key is configured
 *
 * Response: { backend: Status, database: Status, llm: Status, timestamp: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { checkDatabase } from "@/lib/storage";

type Status = "ok" | "error" | "warning";

interface HealthCheck {
  status: Status;
  message: string;
  checked_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const now = new Date().toISOString();

  // Backend is always OK if this endpoint responded
  const backend: HealthCheck = {
    status: "ok",
    message: "Backend is running",
    checked_at: now,
  };

  // Check database
  const dbCheck = checkDatabase();
  const database: HealthCheck = {
    status: dbCheck.status,
    message: dbCheck.message,
    checked_at: now,
  };

  // Check LLM configuration
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const llm: HealthCheck = {
    status: hasGroqKey ? "ok" : "warning",
    message: hasGroqKey
      ? "Groq API configured"
      : "No GROQ_API_KEY set - LLM features unavailable",
    checked_at: now,
  };

  return res.json({
    backend,
    database,
    llm,
    timestamp: now,
  });
}
