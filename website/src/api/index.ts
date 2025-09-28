// file: src/api/index.ts
import { dev } from "$app/environment";
import { API } from "sveltekit-api";
// Import all schemas to register them as components
import { CommonResponses, MinecraftUUIDSchema, PluginCodeOutput, PluginCodeParams, RequestCodeInput, RequestCodeOutput, VerificationCodeSchema, VerifyCodeInput, VerifyCodeOutput } from "$api/schemas";

const servers = [
  {
    url: "https://mc-id.com",
    description: "Production server",
    variables: {
      version: {
        default: "v1",
        enum: ["v1"],
        description: "API version"
      }
    }
  }
];

if (dev) {
  servers.unshift({
    url: "http://localhost:5173",
    description: "Development server",
    variables: {
      version: {
        default: "v1",
        enum: ["v1"],
        description: "API version"
      }
    }
  });
}

export default new API(
  import.meta.glob("./**/*.ts"),
  {
    openapi: "3.2.0",
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
    security: [{ "API Key": [] }]
  },
  "/api",
  (registry) => {
    // Security schemes

    // API Key in header
    registry.registerComponent("securitySchemes", "API Key", {
      type: "apiKey",
      in: "header",
      name: "X-API-Key",
      description: "Your application API key. Obtain one from https://mc-id.com/dashboard/developer/keys."
    });

    // Register schemas as components
    //  Error Response Models
    Object.entries(CommonResponses).forEach(([key, response]) => {
      registry.registerComponent("responses", key, response);
    });

    // Data Type Models
    registry.register("MinecraftUUID", MinecraftUUIDSchema);
    registry.register("VerificationCode", VerificationCodeSchema);

    // Request/Response Models
    registry.register("RequestCodeInput", RequestCodeInput);
    registry.register("RequestCodeOutput", RequestCodeOutput);
    registry.register("VerifyCodeInput", VerifyCodeInput);
    registry.register("VerifyCodeOutput", VerifyCodeOutput);
    registry.register("PluginCodeParams", PluginCodeParams);
    registry.register("PluginCodeOutput", PluginCodeOutput);
  }
);
