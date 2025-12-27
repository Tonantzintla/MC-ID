import { router } from "$api/router";
import { ApiErrorSchema, MinecraftUsernameSchema, MinecraftUUIDSchema, VerificationCodeSchema } from "$api/schemas";
import { dev } from "$app/environment";
import { auth } from "$lib/server/auth";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import type { OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RequestHeadersPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { RequestHandler } from "@sveltejs/kit";

const servers = [
  {
    url: "https://mc-id.com/api",
    description: "Production server",
    variables: {
      version: {
        default: "v1",
        enum: ["v1"],
        description: "API version"
      }
    }
  }
] satisfies OpenAPIGeneratorGenerateOptions["servers"];

if (dev) {
  servers.unshift({
    url: "http://localhost:{port}/api",
    description: "Development server",
    variables: {
      // @ts-expect-error port variable does exist
      port: {
        default: "5173"
      },
      version: {
        default: "v1",
        enum: ["v1"],
        description: "API version"
      }
    }
  });
}

const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    })
  ],
  plugins: [
    new RequestHeadersPlugin(),
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()]
    }),
    new OpenAPIReferencePlugin({
      docsPath: "/",
      specPath: "/openapi.json",
      docsTitle: "API Documentation",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "MC-ID API",
          description: `
The backend API for https://mc-id.com/ that provides authentication for Minecraft accounts.

## Overview
MC-ID allows developers to authenticate Minecraft players in their applications through a simple verification code system. Players enter a 6-digit code in-game, and your application can verify their identity through our API.

<details>
  <summary>Authentication Flow</summary>
  <p>The typical flow for using the MC-ID API is as follows:</p>
  <ol>
    <li><strong>Request Code</strong>: Your app requests a verification code for a specific Minecraft player UUID</li>
    <li><strong>Player Joins</strong>: The player joins the Minecraft server and gets kicked with the code displayed as the kick message</li>
    <li><strong>Player Input</strong>: The player provides the code to your application</li>
    <li><strong>Verify Code</strong>: Your app verifies the code to confirm the player's identity</li>
  </ol>
</details>

<details>
  <summary>Error Handling</summary>
  <p>All endpoints return standardized error responses with proper HTTP status codes. Error responses include:</p>
  <ul>
    <li><code>error</code>: Error category (e.g., "Bad Request", "Unauthorized")</li>
    <li><code>message</code>: Human-readable error message</li>
    <li><code>statusCode</code>: HTTP status code</li>
    <li><code>timestamp</code>: ISO 8601 timestamp when the error occurred</li>
  </ul>
</details>

<details>
  <summary>Rate Limiting</summary>
  <p>The API implements rate limiting to prevent abuse. If you exceed the limits, you'll receive a 429 status code.</p>
</details>
`,
          version: "1",
          contact: {
            name: "Tonantzintla",
            url: "https://github.com/Tonantzintla",
            email: ""
          }
        },
        tags: [
          {
            name: "Codes",
            description: "Authentication code operations for verifying Minecraft players"
          },
          {
            name: "Plugin",
            description: "Minecraft plugin integration endpoints for in-game code display"
          }
        ],
        servers,
        externalDocs: {
          description: "MC-ID Documentation",
          url: "https://docs.mc-id.com"
        },
        security: [{ "API Key": [] }],
        commonSchemas: {
          MinecraftUUID: {
            schema: MinecraftUUIDSchema
          },
          VerificationCode: {
            schema: VerificationCodeSchema
          },
          MinecraftUsername: {
            schema: MinecraftUsernameSchema
          },
          ApiError: {
            schema: ApiErrorSchema
          }
        },
        components: {
          securitySchemes: {
            "API Key": {
              type: "apiKey",
              in: "header",
              name: "X-API-Key",
              description: "Your application API key. Obtain one from https://mc-id.com/dashboard/developer/keys."
            }
          }
        }
      },
      docsConfig: {
        sources: [
          { url: "/api/openapi.json", title: "MC-ID API", slug: "mc-id-api", default: true },
          // Better Auth schema generation endpoint
          { content: await auth.api.generateOpenAPISchema(), title: "Better-Auth API", slug: "better-auth-api" }
        ],
        pageTitle: "API Documentation",
        theme: "saturn",
        metaData: {
          title: "Documentation | MC-ID API",
          description: "Documentation for the MC-ID API",
          ogDescription: "Documentation for the MC-ID API",
          ogTitle: "Documentation | MC-ID API",
          ogImage: "/assets/images/MC-ID.png",
          twitterCard: "summary_large_image"
        },
        favicon: "/favicon.svg",
        persistAuth: true,
        defaultHttpClient: {
          targetKey: "js",
          clientKey: "fetch"
        },
        authentication: {
          securitySchemes: {
            "API Key": {
              type: "apiKey",
              in: "header",
              name: "X-API-Key",
              description: "Your application API key. Obtain one from https://mc-id.com/dashboard/developer/keys."
            }
          }
        }
      }
    })
  ]
});

const handle: RequestHandler = async ({ request }) => {
  const context = request.headers.get("Authorization") ? { user: { id: "test", name: "John Doe", email: "john@doe.com" } } : {};

  const { response } = await handler.handle(request, {
    prefix: "/api",
    context
  });

  return response ?? new Response("Not Found", { status: 404 });
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
