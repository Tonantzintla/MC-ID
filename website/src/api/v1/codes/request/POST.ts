import { CommonResponses, RequestCodeInput, RequestCodeOutput } from "$api/schemas";
import { createError, generateSixDigitCode, getUsernameFromMcid, handleUnexpectedError, logger, requireAppAuth, throwAPIError } from "$api/utils";
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
    400: CommonResponses[400],
    401: CommonResponses[401],
    403: CommonResponses[403],
    404: CommonResponses[404],
    500: CommonResponses[500],
    502: CommonResponses[502]
  };
  return c;
};

export const Input = RequestCodeInput;
export const Output = RequestCodeOutput;

export default new Endpoint({ Input, Output, Modifier }).handle(async (body) => {
  const startTime = Date.now();

  try {
    logger.apiRequest("/codes/request", "POST", { appId: body.appId, uuid: body.uuid });

    // Validate app credentials first
    const { clientId } = await requireAppAuth(body.appId, body.appSecret);

    // Check if the Minecraft user exists
    const username = await getUsernameFromMcid(body.uuid);
    if (!username) {
      throw throwAPIError(createError.minecraftUserNotFound(body.uuid));
    }

    // Find or create MC user
    let user = await db.query.mcuser.findFirst({
      where: (user) => eq(user.id, body.uuid)
    });

    if (!user) {
      logger.userAction("create", body.uuid, { reason: "First time user" });
      user = (await db.insert(mcuser).values({ id: body.uuid }).returning())[0];
      if (!user) {
        throw handleUnexpectedError(new Error(`Failed to create user with ID: ${body.uuid}`), "Database insert failed");
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
        appClientId: clientId, // Use the validated app's client ID
        mcuserId: user.id,
        code,
        expiration
      })
      .onConflictDoUpdate({
        target: [verificationCodes.appClientId, verificationCodes.mcuserId],
        set: {
          code,
          expiration
        }
      });

    const duration = Date.now() - startTime;
    logger.apiResponse("/codes/request", "POST", 200, duration, {
      appId: body.appId,
      uuid: body.uuid,
      username
    });

    return {
      message: "Successfully generated the code.",
      userId: user.id
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("/codes/request", "POST", error, { appId: body.appId, uuid: body.uuid, duration });

    if (error instanceof Error && error.name === "APIError") {
      throw error;
    }

    throw handleUnexpectedError(error, "Code request failed");
  }
});
