import fs from "fs";
import path from "path";
import { Brief } from "./types";

const BRIEFS_FILE = path.join(process.cwd(), ".data", "briefs.json");

/**
 * Ensure the .data directory exists
 */
function ensureDataDir() {
  const dataDir = path.dirname(BRIEFS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Load all briefs from disk
 */
export function loadBriefs(): Brief[] {
  ensureDataDir();
  if (!fs.existsSync(BRIEFS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(BRIEFS_FILE, "utf-8");
    return JSON.parse(data) as Brief[];
  } catch {
    return [];
  }
}

/**
 * Save briefs to disk
 */
export function saveBriefs(briefs: Brief[]): void {
  ensureDataDir();
  fs.writeFileSync(BRIEFS_FILE, JSON.stringify(briefs, null, 2), "utf-8");
}

/**
 * Add a brief to storage
 */
export function addBrief(brief: Brief): void {
  const briefs = loadBriefs();
  briefs.push(brief);
  saveBriefs(briefs);
}

/**
 * Retrieve a brief by ID
 */
export function getBriefById(id: string): Brief | null {
  const briefs = loadBriefs();
  return briefs.find((b) => b.id === id) || null;
}

/**
 * Get the last N briefs
 */
export function getRecentBriefs(count: number = 5): Brief[] {
  const briefs = loadBriefs();
  return briefs.slice(-count).reverse();
}

/**
 * Mark a brief as saved (add saved_at timestamp if not already present)
 */
export function markBriefAsSaved(id: string): void {
  const briefs = loadBriefs();
  const brief = briefs.find((b) => b.id === id);
  if (brief && !brief.saved_at) {
    brief.saved_at = new Date().toISOString();
    saveBriefs(briefs);
  }
}

/**
 * Check if database is working (for health check)
 */
export function checkDatabase(): { status: "ok" | "error"; message: string } {
  try {
    ensureDataDir();
    const testBriefs = loadBriefs();
    return {
      status: "ok",
      message: `Database OK. ${testBriefs.length} briefs stored.`,
    };
  } catch (e) {
    return {
      status: "error",
      message: `Database error: ${String(e)}`,
    };
  }
}
