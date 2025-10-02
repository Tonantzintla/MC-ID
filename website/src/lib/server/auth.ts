import { dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { scopes } from "$lib/scopes";
import { EmailService } from "$lib/server/email-service";
import { hashOptions } from "$lib/server/hash-options";
import { redis } from "$lib/server/redis";
import { generateRandomSecret } from "$lib/server/secret-generator";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, genericOAuth, jwt, oidcProvider, openAPI } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { db } from "./db"; // your drizzle instance

const { PUBLIC_BASE_URL } = publicEnv;
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ADDRESS_HEADER } = privateEnv;

export const auth = betterAuth({
  appName: "MC-ID",
  baseURL: PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg" // or "mysql", "sqlite"
  }),
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { EX: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    }
  },
  rateLimit: {
    storage: "secondary-storage"
  },
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
      enabled: true
    }
  },
  disabledPaths: ["/token"],
  plugins: [
    sveltekitCookies(getRequestEvent),
    passkey({
      rpID: new URL(PUBLIC_BASE_URL).hostname,
      rpName: "MC-ID",
      origin: PUBLIC_BASE_URL
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
      storeClientSecret: {
        hash(clientSecret) {
          return argon2Hash(clientSecret, hashOptions);
        }
      },
      generateClientSecret() {
        return generateRandomSecret();
      },
      scopes: scopes.map((s) => s.value),
      trustedClients: [
        {
          clientId: "MC-ID",
          clientSecret: "secure-secret-here",
          name: "MC-ID",
          type: "web",
          redirectURLs: ["https://localhost:5173", "https://mc-id.com/auth/callback"],
          disabled: false,
          skipConsent: true, // Skip consent for this trusted client
          metadata: { internal: true }
        }
      ]
    }),
    genericOAuth({
      config: [
        {
          providerId: "mc-id",
          clientId: "MC-ID",
          clientSecret: "secure-secret-here",
          discoveryUrl: "http://localhost:5173/api/auth/.well-known/openid-configuration"
          // ... other config options
        }
        // Add more providers as needed
      ]
    }),
    apiKey()
  ],
  advanced: {
    ipAddress: {
      ipAddressHeaders: [(ADDRESS_HEADER || "x-forwarded-for").toLowerCase()]
    },
    useSecureCookies: !dev
  }
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export type Auth = typeof auth;
