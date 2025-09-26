import { z } from "zod";

const name = z.string().min(5, "Name must be at least 5 characters").max(100, "Name must be at most 100 characters");

export const keySchema = z.object({
  name
});

export type KeySchema = typeof keySchema;
