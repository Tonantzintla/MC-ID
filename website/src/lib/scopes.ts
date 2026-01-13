enum Scope {
  PROFILE = "profile",
  EMAIL = "email",
  CONNECTIONS = "connections",
  OPENID = "openid",
  OFFLINE_ACCESS = "offline_access"
}

const scopes = [
  { label: cap(Scope.PROFILE), value: Scope.PROFILE, description: "Access to basic Minecraft profile information (required)", consentDescription: "Know which Minecraft accounts you own" },
  { label: cap(Scope.EMAIL), value: Scope.EMAIL, description: "Access to email addresses", consentDescription: "Access your email address" },
  { label: cap(Scope.CONNECTIONS), value: Scope.CONNECTIONS, description: "Access to connections; e.g. Discord", consentDescription: "Access your linked connections, e.g. Discord" }
] as const;

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export { Scope, scopes };
