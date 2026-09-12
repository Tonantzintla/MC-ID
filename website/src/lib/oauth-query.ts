// Keep UI parameters (such as ?/login and tab) out of the provider's signature.
export function getOAuthQuery(params: URLSearchParams) {
  const names = params.getAll("ba_param");
  if (!params.has("sig") || names.length === 0) return undefined;
  const signed = new Set([...names, "sig", "ba_param"]);
  return new URLSearchParams([...params].filter(([name]) => signed.has(name))).toString();
}
