import { z } from "zod";

/**
 * Citation source for a key point
 */
export const SourceSchema = z.object({
  url: z.string().url(),
  snippet: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

/**
 * A single key point from the brief with supporting sources and credibility
 */
export const KeyPointSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  sources: z.array(SourceSchema),
  credibility: z.enum(["low", "medium", "high"]).default("medium"),
});

export type KeyPoint = z.infer<typeof KeyPointSchema>;

/**
 * A conflicting claim pair for analysis
 */
export const ConflictSchema = z.object({
  id: z.string().uuid(),
  claimA: z.object({
    text: z.string(),
    url: z.string().url(),
  }),
  claimB: z.object({
    text: z.string(),
    url: z.string().url(),
  }),
});

export type Conflict = z.infer<typeof ConflictSchema>;

/**
 * An item to verify from the brief
 */
export const VerifyItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  source: z.string().optional(),
  checked: z.boolean().default(false),
});

export type VerifyItem = z.infer<typeof VerifyItemSchema>;

/**
 * A source URL with optional metadata
 */
export const BriefSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  snippet: z.string().optional(),
});

export type BriefSource = z.infer<typeof BriefSourceSchema>;

/**
 * Complete brief schema - the main output of the LLM
 */
export const BriefSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  key_points: z.array(KeyPointSchema),
  conflicts: z.array(ConflictSchema),
  what_to_verify: z.array(VerifyItemSchema),
  sources: z.array(BriefSourceSchema),
  created_at: z.string().datetime(),
  saved_at: z.string().datetime().optional(),
});

export type Brief = z.infer<typeof BriefSchema>;

/**
 * Generate request payload
 */
export const GenerateRequestSchema = z.object({
  urls: z.array(z.string().url()),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Generate response payload
 */
export const GenerateResponseSchema = z.object({
  id: z.string().uuid(),
  brief: BriefSchema,
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

/**
 * Saved brief metadata (for listing)
 */
export const SavedBriefMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  created_at: z.string().datetime(),
  source_count: z.number(),
});

export type SavedBriefMetadata = z.infer<typeof SavedBriefMetadataSchema>;
