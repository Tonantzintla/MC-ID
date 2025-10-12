import type { Session, User } from "$lib/server/auth";
import type { PrimaryMcAccount } from "$lib/types/global";
// See https://svelte.dev/docs/kit/types#app.d.ts
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
      primaryMcAccount?: PrimaryMcAccount;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
