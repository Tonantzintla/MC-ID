enum Scope {
  PROFILE = "profile",
  EMAIL = "email",
  CONNECTIONS = "connections"
}

const scopes = [
  { label: cap(Scope.PROFILE), value: Scope.PROFILE, description: "Access to basic profile information (required)" },
  { label: cap(Scope.EMAIL), value: Scope.EMAIL, description: "Access to email addresses" },
  { label: cap(Scope.CONNECTIONS), value: Scope.CONNECTIONS, description: "Access to connections; e.g. Discord, Hypixel" }
] as const;

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export { Scope, scopes };
