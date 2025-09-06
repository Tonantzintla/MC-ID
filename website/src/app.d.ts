// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from "better-auth";

// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
      status?: number;
    }
    interface Locals {
      session?: Session;
      user?: User;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
