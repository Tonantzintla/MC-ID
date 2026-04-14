import { building, dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { Scope } from "$lib/scopes";
import { EmailService } from "$lib/server/email-service";
import { getAdditionalUserInfo } from "$lib/server/getAdditionalUserInfo";
import { hashOptions } from "$lib/server/hash-options";
import { generateRandomSecret } from "$lib/server/secret-generator";
import { apiKey } from "@better-auth/api-key";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { admin, customSession, jwt, openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { db } from "./db";

const { PUBLIC_BASE_URL } = publicEnv;
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ADDRESS_HEADER, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = privateEnv;

const BUILD_TIME_AUTH_SECRET = "build-time-placeholder-secret-for-sveltekit-build";
const BUILD_TIME_BASE_URL = "http://localhost:3000";

function getBetterAuthSecret() {
  if (BETTER_AUTH_SECRET) return BETTER_AUTH_SECRET;
  if (building) return BUILD_TIME_AUTH_SECRET;

  throw new Error("BETTER_AUTH_SECRET is required at runtime.");
}

function getBaseURL() {
  if (PUBLIC_BASE_URL) return PUBLIC_BASE_URL;
  if (BETTER_AUTH_URL) return BETTER_AUTH_URL;
  if (building) return BUILD_TIME_BASE_URL;

  throw new Error("PUBLIC_BASE_URL or BETTER_AUTH_URL is required at runtime.");
}

const baseURL = getBaseURL();
const options = {
  appName: "MC-ID",
  baseURL,
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  account: {
    accountLinking: {
      trustedProviders: ["discord"],
      allowDifferentEmails: true
    }
  },
  user: {
    changeEmail: {
      enabled: true
    },
    deleteUser: {
      enabled: true
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
      strategy: "jwe"
    },
    storeSessionInDatabase: true
  },
  emailAndPassword: {
    enabled: true,
    password: {
      verify(data) {
        return argon2Verify(data.hash, data.password, hashOptions);
      },
      hash(data) {
        return argon2Hash(data, hashOptions);
      }
    },
    sendResetPassword: async ({ user, url }) => {
      if (dev) return; // Skip sending emails in development
      const result = await EmailService.sendPasswordResetEmail(user.email, url, baseURL);

      if (!result.success) {
        console.error("Failed to send reset password email:", result.error);
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (dev) return; // Skip sending emails in development
      const result = await EmailService.sendVerificationEmail(user.email, url, baseURL);

      if (!result.success) {
        console.error("Failed to send verification email:", result.error);
      }
    }
  },
  socialProviders: {
    discord: {
      clientId: DISCORD_CLIENT_ID as string,
      clientSecret: DISCORD_CLIENT_SECRET as string,
      scope: ["identify"],
      disableSignUp: true,
      disableDefaultScope: true,
      disableImplicitSignUp: true,
      enabled: true,
      prompt: "consent"
    }
  },
  disabledPaths: ["/token"],
  plugins: [
    sveltekitCookies(getRequestEvent),
    passkey({
      rpID: new URL(baseURL).hostname,
      rpName: "MC-ID",
      origin: baseURL
    }),
    jwt({
      disableSettingJwtHeader: true,
      jwt: {
        issuer: baseURL // Sets OAuth issuer to https://mc-id.com instead of /api/auth
      }
    }),
    openAPI({
      disableDefaultReference: true
    }),
    oauthProvider({
      silenceWarnings: {
        oauthAuthServerConfig: true,
        openidConfig: true
      },
      loginPage: "/login",
      consentPage: "/dashboard/oauth/authorize",
      // Note: Existing plain secrets need to be migrated to hashed format
      generateClientSecret() {
        return generateRandomSecret();
      },

      scopes: Object.values(Scope),
      clientRegistrationDefaultScopes: [Scope.OPENID, Scope.PROFILE],
      advertisedMetadata: {
        scopes_supported: Object.values(Scope),
        claims_supported: ["sub", "name", "email", "email_verified", "accounts", "connections"]
      },
      customUserInfoClaims: async ({ user, scopes: requestedScopes }) => {
        return await getAdditionalUserInfo(user, requestedScopes as Scope[]);
      }
    }),
    apiKey(),
    admin()
  ],
  advanced: {
    ipAddress: {
      ipAddressHeaders: [(ADDRESS_HEADER || "x-forwarded-for").toLowerCase()]
    },
    useSecureCookies: !dev
  }
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const primaryMcAccount = await db.query.minecraftAccount.findFirst({
        where: (mc, { eq, and }) => and(eq(mc.userId, user.id), eq(mc.primary, true)),
        orderBy: (mc, { desc }) => [desc(mc.primary), desc(mc.createdAt)],
        columns: {
          uuid: true,
          username: true
        }
      });
      return {
        primaryMcAccount,
        user: {
          ...user
        },
        session
      };
    }, options)
  ]
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export type Auth = typeof auth;
