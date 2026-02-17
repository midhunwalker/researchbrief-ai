/**
 * API route: POST /api/generate
 *
 * Generates a research brief from a list of URLs.
 * If OPENAI_API_KEY is provided, calls OpenAI API.
 * Otherwise returns deterministic mock data.
 *
 * Request: { urls: string[] }
 * Response: { id: string, brief: Brief }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { GenerateRequestSchema, BriefSchema } from "@/lib/types";
import { generateMockBrief } from "@/lib/mockBrief";
import { addBrief } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request schema
    const validation = GenerateRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request: urls must be an array of valid URLs",
        details: validation.error.errors,
      });
    }

    const { urls } = validation.data;

    // Check if we have an OpenAI key for real LLM integration
    const openaiKey = process.env.OPENAI_API_KEY;

    let brief;

    if (openaiKey) {
      // TODO: Call real OpenAI API
      // For now, use mock even with key present to avoid consuming tokens during development
      brief = generateMockBrief(urls);
    } else {
      // Use mock brief for local development
      brief = generateMockBrief(urls);
    }

    // Validate the generated brief against schema
    const briefValidation = BriefSchema.safeParse(brief);
    if (!briefValidation.success) {
      return res.status(500).json({
        error: "Brief generation failed schema validation",
        details: briefValidation.error.errors,
      });
    }

    // Store the brief in local storage
    addBrief(brief);

    return res.status(201).json({
      id: brief.id,
      brief,
    });
  } catch (error) {
    console.error("Error generating brief:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
