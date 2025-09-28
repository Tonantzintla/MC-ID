// file: src/routes/+server.ts
import api from "$api";
import { auth } from "$lib/server/auth";
import { ScalarApiReference } from "@scalar/sveltekit";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async (evt) => {
  try {
    const [openapi, openapiAuth] = await Promise.all([api.openapi(evt), auth.api.generateOpenAPISchema()]);
    // Combine both OpenAPI schemas into one document
    const render = ScalarApiReference({
      theme: "saturn",
      pageTitle: "API Documentation",
      sources: [
        { content: openapi, title: "MC-ID API", slug: "mc-id-api", default: true },
        // Better Auth schema generation endpoint
        { content: openapiAuth, title: "Better-Auth API", slug: "better-auth-api" }
      ],
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
      }
    });
    return render();
  } catch (err) {
    console.error(err);
    error(500, "Failed to generate API reference");
  }
};
