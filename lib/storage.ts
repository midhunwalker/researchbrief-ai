// NOTE:
// In-memory storage used because Vercel serverless
// does not support persistent filesystem writes.
// For production, replace with database (e.g. Supabase, Neon, Vercel KV).

import { Brief } from "./types";

// In-memory storage (resets on each serverless function cold start)
let briefs: Brief[] = [];

/**
 * Load all briefs from in-memory storage
 */
export function loadBriefs(): Brief[] {
  return briefs;
}

/**
 * Save briefs to in-memory storage
 */
export function saveBriefs(newBriefs: Brief[]): void {
  briefs = newBriefs;
}

/**
 * Add a brief to storage
 */
export function addBrief(brief: Brief): void {
  briefs.push(brief);
}

/**
 * Retrieve a brief by ID
 */
export function getBriefById(id: string): Brief | null {
  return briefs.find((b) => b.id === id) || null;
}

/**
 * Get the last N briefs
 */
export function getRecentBriefs(count: number = 5): Brief[] {
  return briefs.slice(-count).reverse();
}

/**
 * Mark a brief as saved (add saved_at timestamp if not already present)
 */
export function markBriefAsSaved(id: string): void {
  const brief = briefs.find((b) => b.id === id);
  if (brief && !brief.saved_at) {
    brief.saved_at = new Date().toISOString();
  }
}

/**
 * Check if database is working (for health check)
 */
export function checkDatabase(): { status: "ok" | "error"; message: string } {
  try {
    return {
      status: "ok",
      message: `In-memory storage OK. ${briefs.length} briefs stored.`,
    };
  } catch (e) {
    return {
      status: "error",
      message: `Storage error: ${String(e)}`,
    };
  }
}
