import { REPORT_STATUSES } from "$lib/shared/enums/reportEnums";
import { z } from "zod";

const oauthAppIDSchema = z.string().min(1, "OAuth App ID is required");
export const updateOauthAppSchema = z.object({
  oauthAppID: oauthAppIDSchema,
  disabled: z.boolean().optional().nullable()
});

export const deleteOauthAppSchema = z.object({
  oauthAppID: oauthAppIDSchema
});

export const handleReportSchema = z.object({
  oauthAppID: oauthAppIDSchema,
  reportID: z.string().min(1, "Report ID is required"),
  status: z.enum(REPORT_STATUSES),
  resolutionNote: z.string().max(1000)
});

export type UpdateOauthAppSchema = typeof updateOauthAppSchema;
export type DeleteOauthAppSchema = typeof deleteOauthAppSchema;
export type HandleReportSchema = typeof handleReportSchema;
