import { z } from "zod";

const apiKeyIDSchema = z.string().min(1, "API Key ID is required");
export const updateKeySchema = z.object({
  apiKeyID: apiKeyIDSchema,
  enabled: z.boolean().optional().nullable(),
  rateLimitEnabled: z.boolean().optional().nullable(),
  rateLimitTimeWindow: z.number().min(1, "Time window must be at least 1 ms").optional().nullable(),
  rateLimitMax: z.number().min(1, "Max requests must be at least 1").optional().nullable()
});

export const deleteKeySchema = z.object({
  apiKeyID: apiKeyIDSchema
});

export type UpdateKeySchema = typeof updateKeySchema;
export type DeleteKeySchema = typeof deleteKeySchema;
