/**
 * Mock brief data for testing without API keys
 * Used when OPENAI_API_KEY is not provided
 */

import { Brief } from "@/lib/types";
import { randomUUID } from "crypto";

export function generateMockBrief(urls: string[]): Brief {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    title: "Research Brief: Topic Analysis",
    summary:
      "This research brief provides a comprehensive analysis of the submitted URLs. The analysis identifies key themes, conflicting viewpoints, and areas requiring further verification. Based on the extracted content, several important claims and perspectives have been identified across the sources.",
    key_points: [
      {
        id: randomUUID(),
        text: "The primary argument suggests a significant trend in recent market movements",
        sources: [
          {
            url: urls[0] || "https://example.com",
            snippet:
              "Recent market analysis shows significant changes across multiple sectors...",
          },
        ],
        credibility: "high",
      },
      {
        id: randomUUID(),
        text: "Secondary sources indicate emerging regulatory frameworks are being developed",
        sources: [
          {
            url: urls[1] || "https://example.com",
            snippet:
              "Regulatory bodies are working on new guidelines to address market concerns...",
          },
        ],
        credibility: "medium",
      },
      {
        id: randomUUID(),
        text: "Additional context points to industry-specific challenges",
        sources: [
          {
            url: urls[2] || "https://example.com",
            snippet:
              "The industry faces several challenges including infrastructure limitations...",
          },
        ],
        credibility: "medium",
      },
    ],
    conflicts: [
      {
        id: randomUUID(),
        claimA: {
          text: "Market growth is accelerating rapidly",
          url: urls[0] || "https://example.com",
        },
        claimB: {
          text: "Market expansion has plateaued in recent quarters",
          url: urls[1] || "https://example.com",
        },
      },
    ],
    what_to_verify: [
      {
        id: randomUUID(),
        text: "Confirm recent financial metrics from official sources",
        source: urls[0] || "https://example.com",
        checked: false,
      },
      {
        id: randomUUID(),
        text: "Verify regulatory body statements about new frameworks",
        source: urls[1] || "https://example.com",
        checked: false,
      },
      {
        id: randomUUID(),
        text: "Research industry-specific infrastructure requirements",
        checked: false,
      },
    ],
    sources: urls.map((url) => ({
      url,
      title: `Source: ${new URL(url).hostname}`,
      snippet: "Content summary from this source would appear here...",
    })),
    created_at: now,
  };
}
