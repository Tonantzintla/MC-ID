import { building } from "$app/environment";
import { auth } from "$lib/server/auth"; // path to your auth file
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

const protectedRouteGroupName = "(protected)";
const signInPath = "/login";

const betterAuthHandler = (async ({ event, resolve }) => {
  return svelteKitHandler({
    event,
    resolve,
    auth,
    building
  });
}) satisfies Handle;

const betterAuthSessionHandler = (async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  event.locals.session = session?.session;
  event.locals.user = session?.user;

  return resolve(event);
}) satisfies Handle;

const protectedHandler = (async ({ event, resolve }) => {
  const { locals, route } = event;
  if (!locals.user) {
    if (route.id?.includes(protectedRouteGroupName) || event.isRemoteRequest) {
      redirect(307, signInPath);
    }
  }
  return resolve(event);
}) satisfies Handle;

const headersHandler = (async ({ event, resolve }) => {
  const response = await resolve(event);

  // Security headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Cross-Origin policies
  response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  // Legacy XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}) satisfies Handle;

export const handle = sequence(betterAuthHandler, betterAuthSessionHandler, protectedHandler, headersHandler) satisfies Handle;
