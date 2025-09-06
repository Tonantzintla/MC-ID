import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/public";
import { hash, verify, type Options } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt, openAPI, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { username as usernameSchema } from "../../routes/login/schema";
import { db } from "./db"; // your drizzle instance

const { PUBLIC_BASE_URL } = env;

const hashOptions = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
} satisfies Options;

export const auth = betterAuth({
  appName: "MC-ID",
  baseURL: PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg" // or "mysql", "sqlite"
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Modify the user object before it is created
          return {
            data: {
              ...user,
              id: ctx?.body.uuid,
              name: ctx?.body.username
            }
          };
        }
      }
    },
    account: {
      create: {
        before: async (account, _) => {
          // Modify the account object before it is created
          return {
            data: {
              ...account,
              id: account.userId
            }
          };
        }
      }
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
        return verify(data.hash, data.password, hashOptions);
      },
      hash(data) {
        return hash(data, hashOptions);
      }
    }
  },
  plugins: [
    sveltekitCookies(getRequestEvent),
    passkey({
      rpID: new URL(PUBLIC_BASE_URL).hostname,
      rpName: "MC-ID",
      origin: PUBLIC_BASE_URL
    }),
    username({
      usernameNormalization: false,
      usernameValidator: async (username) => {
        try {
          usernameSchema.parse(username);
          return true;
        } catch {
          return false;
        }
      }
    }),
    bearer(),
    jwt(),
    openAPI()
  ]
});
