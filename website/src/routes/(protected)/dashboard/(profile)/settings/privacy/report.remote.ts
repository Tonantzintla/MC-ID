import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { oauthClientReport, reportReasonEnum } from "$lib/shared/db/schema/reports";
import { deleteConsent } from "$src/routes/(protected)/dashboard/(profile)/settings/privacy/consented-apps.remote";
import { error } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

const reportReasons = reportReasonEnum.enumValues;

const reportSchema = z.object({
  clientId: z.string(),
  reason: z.enum(reportReasons),
  description: z.optional(z.string()),
  consentId: z.string()
});

export const submitReport = command(reportSchema, async ({ clientId, reason, description, consentId }) => {
  const { locals } = getRequestEvent();
  const { user } = locals;

  if (!user?.id) {
    error(401, "Unauthorized");
  }

  try {
    await db.insert(oauthClientReport).values({
      reporterId: user.id,
      clientId,
      reason,
      description: description || null
    });

    await deleteConsent(consentId).catch((err) => {
      console.error("Error deleting consent after report", err);
    });

    return { success: true, message: "Report submitted successfully" };
  } catch (err) {
    console.error("Error submitting report", err);
    error(500, "Failed to submit report");
  }
});
