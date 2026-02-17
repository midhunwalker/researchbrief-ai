# Prompts Used

## Overview

This document describes the exact prompts and schemas used for LLM integration in the ResearchBrief application. The prompts are designed to produce structured JSON output matching the Zod validation schema defined in `lib/types.ts`.

**Important**: This file contains only prompts and schema documentation. No API keys, secrets, or actual LLM responses are included.

---

## System Prompt

The system prompt establishes the LLM's role and output requirements:

```
You are an expert research analyst specializing in synthesizing information from multiple sources.

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

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.
```

---

## User Prompt Template

The user prompt provides the URLs and enforces JSON-only output:

```
Analyze these research URLs and generate a comprehensive brief:

URLs:
{URLS_HERE}

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
  "created_at": "2024-02-15T12:00:00.000Z"
}

Rules:
- Include 3-5 key points minimum
- Include at least 1 conflict if sources disagree
- Include 2-4 verification items
- Every key point must have at least one source with snippet
- Credibility must be "low", "medium", or "high"
- All IDs must be unique UUID v4 format
- created_at must be current timestamp in ISO 8601 format
```

---

## JSON Schema Definition

The LLM output is validated against these Zod schemas (defined in `lib/types.ts`):

### Brief Schema

```typescript
{
  id: string (UUID v4),
  title: string (non-empty),
  summary: string (non-empty),
  key_points: KeyPoint[] (array),
  conflicts: Conflict[] (array),
  what_to_verify: VerifyItem[] (array),
  sources: BriefSource[] (array, at least 1),
  created_at: string (ISO 8601),
  saved_at?: string (ISO 8601, optional)
}
```

### KeyPoint Schema

```typescript
{
  id: string (UUID v4),
  text: string (non-empty),
  sources: Source[] (array, at least 1),
  credibility: "low" | "medium" | "high"
}
```

### Source Schema (within KeyPoint)

```typescript
{
  url: string (valid URL),
  snippet: string (non-empty)
}
```

### Conflict Schema

```typescript
{
  id: string (UUID v4),
  claimA: {
    text: string (non-empty),
    url: string (valid URL)
  },
  claimB: {
    text: string (non-empty),
    url: string (valid URL)
  }
}
```

### VerifyItem Schema

```typescript
{
  id: string (UUID v4),
  text: string (non-empty),
  source?: string (valid URL, optional),
  checked: boolean (default: false)
}
```

### BriefSource Schema

```typescript
{
  url: string (valid URL),
  title: string (non-empty),
  snippet: string (non-empty)
}
```

---

## Prompt Engineering Strategy

### 1. Explicit JSON Enforcement
- Multiple instructions emphasizing "ONLY JSON"
- Prohibition of markdown, code blocks, and extra text
- Clear structure example in prompt

### 2. Schema Compliance
- Exact field names and types specified
- Required vs optional fields clearly marked
- Enum values explicitly listed ("low", "medium", "high")
- UUID v4 format requirement stated

### 3. Content Quality
- Request for 2-3 paragraph summaries (sufficient detail)
- Minimum counts for key points (3-5) and verification items (2-4)
- Requirement for direct quotes (snippets) from sources
- Explicit request for conflict identification

### 4. Credibility Assessment
- Three-tier rating system (low/medium/high)
- Forces LLM to evaluate source reliability
- Provides user with trust indicators

### 5. Error Prevention
- Requires at least 1 source per key point
- Mandates at least 1 source in sources array
- Specifies ISO 8601 format for timestamps
- UUID v4 format prevents ID collisions

---

## Integration Implementation

### API Route (`pages/api/generate.ts`)

The prompt is sent to OpenAI's API like this:

```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: SYSTEM_PROMPT 
      },
      { 
        role: "user", 
        content: USER_PROMPT_WITH_URLS 
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  }),
});
```

**Note**: `response_format: { type: "json_object" }` is OpenAI's JSON mode, ensuring valid JSON output.

### Validation After LLM Response

```typescript
// Parse the LLM response
const parsed = JSON.parse(response.choices[0].message.content);

// Validate against Zod schema
const validation = BriefSchema.safeParse(parsed);

if (!validation.success) {
  return res.status(400).json({
    error: "LLM output failed schema validation",
    details: validation.error.errors
  });
}

// Use validated data
const brief = validation.data;
```

---

## Mock Mode Fallback

When `OPENAI_API_KEY` is not set, the application uses `generateMockBrief()` from `lib/mockBrief.ts`. This function:

1. Generates a brief matching the exact schema
2. Uses provided URLs in sources
3. Returns deterministic, realistic data
4. Enables full UI testing without API calls

---

## Example Brief Structure

For reference, a complete example brief structure (with placeholder content):

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Climate Change Impact on Global Agriculture",
  "summary": "Multiple sources indicate significant impacts of climate change on global agriculture, with particular concern for crop yields and food security. The consensus suggests temperature increases and changing precipitation patterns pose substantial risks. However, sources differ on the severity and timeline of impacts.",
  "key_points": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d",
      "text": "Global crop yields projected to decrease by 10-25% by 2050",
      "sources": [
        {
          "url": "https://example.com/agriculture-report",
          "snippet": "Our models predict a 10-25% reduction in global crop yields by mid-century under current emission scenarios."
        }
      ],
      "credibility": "high"
    }
  ],
  "conflicts": [
    {
      "id": "b2c3d4e5-f6a7-4b5c-8d7e-9f8a7b6c5d4e",
      "claimA": {
        "text": "Technological adaptation can fully offset climate impacts",
        "url": "https://example.com/tech-optimism"
      },
      "claimB": {
        "text": "Technology alone cannot compensate for projected climate changes",
        "url": "https://example.com/climate-reality"
      }
    }
  ],
  "what_to_verify": [
    {
      "id": "c3d4e5f6-a7b8-4c5d-8e7f-9a8b7c6d5e4f",
      "text": "Verify the 10-25% crop yield projection methodology",
      "source": "https://example.com/agriculture-report",
      "checked": false
    }
  ],
  "sources": [
    {
      "url": "https://example.com/agriculture-report",
      "title": "Global Agriculture and Climate Change Report 2024",
      "snippet": "Comprehensive analysis of climate impacts on farming"
    }
  ],
  "created_at": "2024-02-15T14:30:00.000Z"
}
```

---

## Prompt Iteration Notes

### Why These Prompts Work

1. **Explicit Structure**: Showing exact JSON format reduces ambiguity
2. **Multiple Constraints**: Overlapping instructions (ONLY JSON, no markdown, no code blocks) ensure compliance
3. **Minimum Requirements**: Specifying counts (3-5 key points) ensures sufficient detail
4. **Source Citation**: Requiring snippets improves credibility and traceability
5. **Conflict Detection**: Explicitly asking for disagreements surfaces important nuances

### Common Issues Prevented

- **Extra Text**: "ONLY JSON" prevents explanations before/after JSON
- **Invalid IDs**: UUID v4 requirement prevents malformed IDs
- **Missing Sources**: Minimum 1 source per key point prevents unsupported claims
- **Wrong Credibility**: Enum specification prevents typos ("High" vs "high")
- **Timestamp Format**: ISO 8601 requirement ensures parseable dates

---

## Future Improvements

Planned enhancements to prompt design:

- [ ] Add few-shot examples for complex topics
- [ ] Chain-of-thought prompting for deeper analysis
- [ ] Domain-specific prompts (medical, legal, technical)
- [ ] Streaming support for long briefs
- [ ] Multi-turn refinement for low-credibility outputs

### KeyPoint
- `id`: UUID v4
- `text`: Non-empty string
- `sources`: Array with at least one Source
- `credibility`: Enum("low", "medium", "high")

### Conflict
- `id`: UUID v4
- `claimA`: Object with `text` and `url`
- `claimB`: Object with `text` and `url`

### VerifyItem
- `id`: UUID v4
- `text`: Non-empty string
- `source`: Optional URL string
- `checked`: Boolean (default: false)

## Integration Notes

### Current Implementation
When `OPENAI_API_KEY` is set, the `/api/generate` route can be wired to call:
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT_WITH_URLS },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  }),
});
```

### Validation After LLM Call
```typescript
const parsed = JSON.parse(response.content);
const validated = BriefSchema.parse(parsed);
```

If validation fails, return 400 error with details.

### Fallback Mock Data
When no API key is provided, `generateMockBrief()` creates a realistic brief for testing UI/UX.

## Example Brief Output

See `lib/mockBrief.ts` for a complete example of the expected JSON structure.

## Prompt Engineering Notes

1. **Clarity**: Be explicit about JSON structure requirements
2. **Citations**: Require source snippets for credibility
3. **Conflicts**: Ask explicitly for conflicting claims
4. **Verification**: Request items requiring fact-checking
5. **Tone**: Ask for objective, neutral analysis
6. **Format**: Specify return format constraints ("ONLY JSON", no markdown)

## Future Improvements

- [ ] Support for multiple LLM providers (Anthropic, Google)
- [ ] Streaming responses for long analysis
- [ ] Fine-tuned prompts per document type
- [ ] Chain-of-thought prompting for complex analysis
- [ ] Custom credibility criteria per domain
