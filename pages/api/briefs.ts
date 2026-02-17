/**
 * API route: GET/PUT /api/briefs
 *
 * GET: Retrieve saved briefs or a specific brief by ID
 * PUT: Mark a brief as saved
 *
 * Query params:
 *   - id: retrieve a specific brief by ID
 *   - saved: if "true", return only saved briefs
 *
 * Response: Brief[] or Brief
 */

import type { NextApiRequest, NextApiResponse } from "next";
import {
  loadBriefs,
  getBriefById,
  getRecentBriefs,
  markBriefAsSaved,
} from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const briefId = req.query.id as string | undefined;
      const savedOnly = req.query.saved === "true";

      if (briefId) {
        // Retrieve a specific brief
        const brief = getBriefById(briefId);
        if (!brief) {
          return res.status(404).json({ error: "Brief not found" });
        }
        return res.json(brief);
      }

      if (savedOnly) {
        // Return only saved briefs (those with saved_at timestamp)
        const allBriefs = loadBriefs();
        const savedBriefs = allBriefs.filter((b) => b.saved_at);
        return res.json(savedBriefs);
      }

      // Return recent briefs (last 5)
      const recentBriefs = getRecentBriefs(5);
      return res.json(recentBriefs);
    } catch (error) {
      console.error("Error fetching briefs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Brief ID is required" });
      }

      // Check if brief exists
      const brief = getBriefById(id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }

      // Mark as saved
      markBriefAsSaved(id);

      return res.json({ success: true, brief });
    } catch (error) {
      console.error("Error saving brief:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
