import { z } from "zod";

const name = z.string().min(3, "The name must be at least 3 characters long").max(32, "The name must be at most 32 characters long");
const website = z.url("The website must be a valid URL").min(3);
const description = z.string().min(10, "The description must be at least 10 characters long").max(500, "The description must be at most 500 characters long");
const id = z.string().optional();

export const appSchema = z.object({
  name,
  website,
  description,
  id
});

export type AppSchema = typeof appSchema;
