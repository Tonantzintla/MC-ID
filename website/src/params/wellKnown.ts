import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
  const isWellKnownPath = /^\.well-known(?:\/.*)?$/i.test(param);
  return isWellKnownPath;
};
