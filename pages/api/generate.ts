/**
 * API route: POST /api/generate
 *
 * Generates a research brief from URLs using Groq API (Llama 3 70B).
 * 
 * IMPORTANT: Requires GROQ_API_KEY environment variable.
 * Real Groq tokens will be consumed on each request.
 * 
 * To configure:
 * 1. Get API key from https://console.groq.com/keys
 * 2. Add to .env.local: GROQ_API_KEY=gsk-...
 * 3. Restart server
 *
 * Request: { urls: string[] }
 * Response: { id: string, brief: Brief }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { GenerateRequestSchema, BriefSchema } from "@/lib/types";
import { addBrief } from "@/lib/storage";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature: number;
  max_tokens: number;
  response_format?: { type: "json_object" };
}

interface GroqChoice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
}

interface GroqResponse {
  choices: GroqChoice[];
  id: string;
  model: string;
}

interface GroqErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

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

    // Check if Groq API key is configured
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(400).json({
        error: "LLM not configured",
        message: "GROQ_API_KEY environment variable is not set. Add your Groq API key to .env.local to enable brief generation.",
      });
    }

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

    // Prepare Groq API request
    const groqRequest: GroqRequest = {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    };

    // Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqRequest),
    });

    if (!groqResponse.ok) {
      const errorData = (await groqResponse.json()) as GroqErrorResponse;
      
      // Handle rate limit errors
      if (groqResponse.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        });
      }

      // Handle other API errors
      return res.status(groqResponse.status).json({
        error: "Groq API error",
        message: errorData.error?.message || "Unknown API error",
        type: errorData.error?.type,
      });
    }

    const groqData = (await groqResponse.json()) as GroqResponse;

    // Extract response content
    const responseContent = groqData.choices[0]?.message?.content;
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
      return res.status(500).json({
        error: "LLM returned invalid JSON",
        details: parseError instanceof Error ? parseError.message : "Unknown parse error",
      });
    }

    // Validate against Zod schema
    const briefValidation = BriefSchema.safeParse(parsedBrief);
    if (!briefValidation.success) {
      return res.status(500).json({
        error: "Brief generation failed schema validation",
        details: briefValidation.error.errors,
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
    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return res.status(500).json({
        error: "Network error",
        message: "Failed to connect to Groq API",
      });
    }

    // Generic error handler
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
