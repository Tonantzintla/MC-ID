import { ORPCError } from "@orpc/server";
import crypto from "crypto";
import ky, { HTTPError } from "ky";
import { logger } from "./utils/logger";

// Re-export utilities
export * from "./utils/logger";

interface MojangProfileResponse {
  id: string;
  name: string;
}

export type Permissions = {
  [resourceType: string]: string[];
};

export const defaultPermissions: Permissions = {
  codes: ["request", "verify"]
} as const;

export async function getUsernameFromMcid(uuid: string): Promise<string | null> {
  const startTime = Date.now();

  try {
    logger.debug("Fetching username from Mojang API", { uuid });

    const mojangApiUrl = `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`;
    const response = await ky.get(mojangApiUrl, { timeout: 5000 }).json<MojangProfileResponse>();

    const duration = Date.now() - startTime;
    logger.debug("Successfully fetched username from Mojang API", {
      uuid,
      username: response.name,
      duration
    });

    return response.name;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof HTTPError) {
      if (error.response.status === 404) {
        logger.info("Minecraft user not found in Mojang API", { uuid, duration });
        return null;
      }
      logger.error("Mojang API HTTP error", error, { uuid, duration, status: error.response.status });

      throw new ORPCError("MOJANG_API_ERROR", {
        message: "Error fetching data from Mojang API",
        status: 502,
        cause: error
      });
    }

    logger.error("Unexpected error calling Mojang API", error, { uuid, duration });

    throw new ORPCError("MOJANG_API_ERROR", {
      message: "Error fetching data from Mojang API",
      status: 502,
      cause: error instanceof Error ? error : undefined
    });
  }
}

export async function getMcidFromUsername(username: string): Promise<string | null> {
  const startTime = Date.now();

  try {
    logger.debug("Fetching MCID from Mojang API", { username });

    const mojangApiUrl = `https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`;
    const response = await ky.get(mojangApiUrl, { timeout: 5000 }).json<MojangProfileResponse>();

    const duration = Date.now() - startTime;
    logger.debug("Successfully fetched MCID from Mojang API", {
      username,
      uuid: response.id,
      duration
    });

    return response.id;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof HTTPError) {
      if (error.response.status === 404) {
        logger.info("Username not found in Mojang API", { username, duration });
        return null;
      }
      logger.error("Mojang API HTTP error", error, { username, duration, status: error.response.status });

      throw new ORPCError("MOJANG_API_ERROR", {
        message: "Error fetching data from Mojang API",
        status: 502,
        cause: error
      });
    }

    logger.error("Unexpected error calling Mojang API", error, { username, duration });

    throw new ORPCError("MOJANG_API_ERROR", {
      message: "Error fetching data from Mojang API",
      status: 502,
      cause: error instanceof Error ? error : undefined
    });
  }
}

export async function generateSixDigitCode(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    crypto.randomInt(100000, 999999, (err, n) => {
      if (err) {
        logger.error("Failed to generate secure random number", err);
        reject(err);
        return;
      }
      logger.debug("Generated new verification code");
      resolve(n.toString());
    });
  });
}
