/**
 * Client-side API helpers for calling Next.js API routes
 */

import { GenerateRequest, GenerateResponse, Brief } from "./types";

const API_BASE = "/api";

/**
 * Generate a new brief from URLs
 */
export async function generateBrief(urls: string[]): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls } as GenerateRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate brief");
  }

  return response.json();
}

/**
 * Get all saved briefs
 */
export async function getSavedBriefs(): Promise<Brief[]> {
  const response = await fetch(`${API_BASE}/briefs`);

  if (!response.ok) {
    throw new Error("Failed to fetch briefs");
  }

  return response.json();
}

/**
 * Get a single brief by ID
 */
export async function getBrief(id: string): Promise<Brief> {
  const response = await fetch(`${API_BASE}/briefs?id=${id}`);

  if (!response.ok) {
    throw new Error("Brief not found");
  }

  return response.json();
}

/**
 * Save a brief
 */
export async function saveBrief(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/briefs`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Failed to save brief");
  }
}

/**
 * Validate URLs - simple regex check
 */
export function validateUrls(urlString: string): string[] {
  const urls = urlString
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  const urlRegex =
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/i;
  return urls.filter((url) => urlRegex.test(url));
}

/**
 * Format a date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time for display
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
