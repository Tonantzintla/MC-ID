import { CommonResponses, RequestCodeInput, RequestCodeOutput } from "$api/schemas";
import { CommonCodeErrors, CommonErrors, createAPIError, createError, createHandleUnexpectedError, defaultPermissions, ErrorTypes, generateSixDigitCode, getUsernameFromMcid, logger, requireApiKey } from "$api/utils";
import { resolve } from "$app/paths";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { mcuser, verificationCodes } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { Endpoint, type RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (c) => {
  c.summary = "Request authentication code for application";
  c.description = `
Generate a new 6-digit verification code for a Minecraft player to authenticate with your application.

> [!note] Important Notes:  
> - Only one active code per app-user combination is allowed
> - Previous codes are automatically replaced
> - Codes expire after 5 minutes
`;
  c.tags = ["Codes"];
  c.responses = {
    201: {
      description: "Verification code generated successfully",
      content: {
        "application/json": {
          schema: RequestCodeOutput,
          example: {
            message: "Successfully generated the code.",
            userId: "069a79f444e94726a5befca90e38aaf5"
          }
        }
      }
    },
    ...Object.fromEntries(Object.entries(c.responses).filter(([status]) => status !== "200")),
    ...CommonResponses
  };
  return c;
};

export const Input = RequestCodeInput;
export const Output = RequestCodeOutput;

export const Errors = {
  ...CommonErrors,
  ...CommonCodeErrors,
  [ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode]: createAPIError(createError.minecraftUserNotFound())
};

export default new Endpoint({ Input, Output, Modifier }).handle(async (body) => {
  const startTime = Date.now();
  const resolved = resolve("/api/v1/codes/request");
  try {
    logger.apiRequest(resolved, "POST", { uuid: body.uuid });

    const { request } = getRequestEvent();
    const { headers } = request;
    const xApiKey = headers.get("x-api-key");

    const { key: apiKey } = await requireApiKey(xApiKey, defaultPermissions);

    // Check if the Minecraft user exists
    const username = await getUsernameFromMcid(body.uuid);
    if (!username) {
      logger.error("User UUID no longer valid in Mojang API", null, { uuid: body.uuid });
      throw Errors[ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode];
    }

    // Find or create MC user
    let user = await db.query.mcuser.findFirst({
      where: (user) => eq(user.id, body.uuid)
    });

    if (!user) {
      logger.userAction("create", body.uuid, { reason: "First time user" });
      user = (await db.insert(mcuser).values({ id: body.uuid }).returning())[0];
      if (!user) {
        throw createHandleUnexpectedError(new Error(`Failed to create user with ID: ${body.uuid}`), "Database insert failed");
      }
      logger.info("Successfully created new user", { userId: user.id });
    }

    // Generate verification code
    const code = await generateSixDigitCode();
    const expiration = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    // Store the code (upsert)
    await db
      .insert(verificationCodes)
      .values({
        appApiKeyId: apiKey.id,
        mcuserId: user.id,
        code,
        expiration
      })
      .onConflictDoUpdate({
        target: [verificationCodes.appApiKeyId, verificationCodes.mcuserId],
        set: {
          code,
          expiration
        }
      });

    const duration = Date.now() - startTime;
    logger.apiResponse(resolved, "POST", 200, duration, {
      uuid: body.uuid,
      username
    });

    return {
      message: "Successfully generated the code.",
      userId: user.id
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.apiError(resolved, "POST", err, { uuid: body.uuid, duration });

    if (err instanceof Error && err.name === "APIError") {
      throw err;
    }

    throw createHandleUnexpectedError(err, "Code request failed");
  }
});
