/**
 * API route: POST /api/generate
 *
 * Generates a research brief from URLs using OpenAI GPT-4 API.
 * 
 * IMPORTANT: Requires OPENAI_API_KEY environment variable.
 * Real OpenAI tokens will be consumed on each request.
 * 
 * To configure:
 * 1. Get API key from https://platform.openai.com/api-keys
 * 2. Add to .env.local: OPENAI_API_KEY=sk-...
 * 3. Restart server
 *
 * Request: { urls: string[] }
 * Response: { id: string, brief: Brief }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { GenerateRequestSchema, BriefSchema } from "@/lib/types";
import { addBrief } from "@/lib/storage";
import { randomUUID } from "crypto";

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

    // Check if OpenAI API key is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(400).json({
        error: "LLM not configured",
        message: "OPENAI_API_KEY environment variable is not set. Add your OpenAI API key to .env.local to enable brief generation.",
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // System prompt defining the assistant's role
    const systemPrompt = `You are an expert research analyst specializing in synthesizing information from multiple sources.

Your task is to:
1. Analyze the provided URLs and their content
2. Extract key information and themes
3. Identify areas of agreement and conflict across sources
4. Highlight claims requiring verification
5. Return a structured JSON brief

Requirements:
- Be objective and neutral in your analysis
- Cite specific sources with direct quotes (snippets)
- Flag conflicting claims clearly with both sides
- Suggest items for fact-checking in the verification list
- Rate credibility of key points (low/medium/high)
- Use ISO 8601 format for timestamps
- Generate UUID v4 for all IDs

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

    // User prompt with URLs and schema
    const userPrompt = `Analyze these research URLs and generate a comprehensive brief:

URLs:
${urls.join("\n")}

Respond with ONLY a JSON object matching this exact structure. Do not include markdown formatting, code blocks, or any text outside the JSON:

{
  "id": "uuid-v4-string",
  "title": "Brief title describing the topic",
  "summary": "2-3 paragraph summary synthesizing all sources. Include main themes, consensus points, and areas of disagreement.",
  "key_points": [
    {
      "id": "uuid-v4-string",
      "text": "A specific finding or insight from the research",
      "sources": [
        {
          "url": "https://example.com/source",
          "snippet": "Direct quote from the source supporting this point"
        }
      ],
      "credibility": "high"
    }
  ],
  "conflicts": [
    {
      "id": "uuid-v4-string",
      "claimA": {
        "text": "First claim or perspective",
        "url": "https://source-a.com"
      },
      "claimB": {
        "text": "Conflicting claim or perspective",
        "url": "https://source-b.com"
      }
    }
  ],
  "what_to_verify": [
    {
      "id": "uuid-v4-string",
      "text": "Claim or statistic that requires verification",
      "source": "https://source.com",
      "checked": false
    }
  ],
  "sources": [
    {
      "url": "https://example.com",
      "title": "Source Title",
      "snippet": "Brief summary of what this source covers"
    }
  ],
  "created_at": "${new Date().toISOString()}"
}

Rules:
- Include 3-5 key points minimum
- Include at least 1 conflict if sources disagree
- Include 2-4 verification items
- Every key point must have at least one source with snippet
- Credibility must be "low", "medium", or "high"
- All IDs must be unique UUID v4 format
- created_at must be ISO 8601 format`;

    // Call OpenAI API with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return res.status(500).json({
        error: "LLM returned empty response",
      });
    }

    // Parse JSON response
    let parsedBrief;
    try {
      parsedBrief = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", parseError);
      return res.status(500).json({
        error: "LLM returned invalid JSON",
        details: parseError instanceof Error ? parseError.message : "Unknown parse error",
      });
    }

    // Validate against Zod schema
    const briefValidation = BriefSchema.safeParse(parsedBrief);
    if (!briefValidation.success) {
      console.error("LLM output failed schema validation:", briefValidation.error);
      return res.status(500).json({
        error: "Brief generation failed schema validation",
        details: briefValidation.error.errors,
        llmResponse: parsedBrief,
      });
    }

    const brief = briefValidation.data;

    // Store the brief in memory
    addBrief(brief);

    return res.status(201).json({
      id: brief.id,
      brief,
    });
  } catch (error) {
    console.error("Error generating brief:", error);

    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: "OpenAI API error",
        message: error.message,
        type: error.type,
      });
    }

    // Handle rate limit errors
    if (error instanceof Error && error.message.includes("rate limit")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
      });
    }

    // Generic error handler
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
