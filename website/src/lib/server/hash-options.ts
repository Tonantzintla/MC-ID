import type { Options } from "@node-rs/argon2";

const hashOptions = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
} satisfies Options;

export { hashOptions };
