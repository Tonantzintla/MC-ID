import { Options as Argon2Options } from '@node-rs/argon2';
export const HASHING_OPTIONS: Argon2Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};
