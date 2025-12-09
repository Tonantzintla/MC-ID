import { dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { Scope, scopes } from "$lib/scopes";
import { EmailService } from "$lib/server/email-service";
import { getAdditionalUserInfo } from "$lib/server/getAdditionalUserInfo";
import { hashOptions } from "$lib/server/hash-options";
import { generateRandomSecret } from "$lib/server/secret-generator";
import { passkey } from "@better-auth/passkey";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { apiKey, customSession, jwt, oidcProvider, openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { db } from "./db"; // your drizzle instance

const { PUBLIC_BASE_URL } = publicEnv;
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ADDRESS_HEADER } = privateEnv;

const options = {
  appName: "MC-ID",
  baseURL: PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg" // or "mysql", "sqlite"
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
      const result = await EmailService.sendPasswordResetEmail(user.email, url, PUBLIC_BASE_URL);

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
      const result = await EmailService.sendVerificationEmail(user.email, url, PUBLIC_BASE_URL);

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
      rpID: new URL(PUBLIC_BASE_URL || "http://localhost:3000").hostname,
      rpName: "MC-ID",
      origin: PUBLIC_BASE_URL || "http://localhost:3000"
    }),
    jwt({
      disableSettingJwtHeader: true
    }),
    openAPI({
      disableDefaultReference: true
    }),
    oidcProvider({
      useJWTPlugin: true, // Enable JWT plugin integration
      loginPage: "/login",
      storeClientSecret: "plain",
      // storeClientSecret: {
      //   hash(clientSecret) {
      //     return argon2Hash(clientSecret, hashOptions);
      //   }
      // },
      generateClientSecret() {
        return generateRandomSecret();
      },
      scopes: scopes.map((s) => s.value),
      metadata: {
        scopes_supported: scopes.map((s) => s.value),
        claims_supported: ["sub", "email", "accounts", "connections"]
      },
      defaultScope: Scope.PROFILE,
      getAdditionalUserInfoClaim: async (user, scopes, client) => {
        return await getAdditionalUserInfo(user, scopes, client);
      },
      consentPage: "/dashboard/oauth/authorize"
    }),
    apiKey()
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
