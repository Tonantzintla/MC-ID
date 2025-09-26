import * as crypto from "node:crypto";

function generateRandomSecret(length = 32) {
  if (length % 2 !== 0) {
    throw new Error("Length must be an even number for hexadecimal representation.");
  }
  const numBytes = length / 2;
  return crypto.randomBytes(numBytes).toString("hex");
}

export { generateRandomSecret };
