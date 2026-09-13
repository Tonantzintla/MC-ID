enum Scope {
  PROFILE = "profile",
  EMAIL = "email",
  CONNECTIONS = "connections",
  OPENID = "openid",
  OFFLINE_ACCESS = "offline_access"
}

const scopes = [
  {
    label: "OpenID Connect",
    value: Scope.OPENID,
    description: "Identify users with OpenID Connect ID tokens",
    consentDescription: "Identify your MC-ID account"
  },
  {
    label: cap(Scope.PROFILE),
    value: Scope.PROFILE,
    description: "Access to basic Minecraft profile information",
    consentDescription: "Know which Minecraft accounts you own"
  },
  {
    label: cap(Scope.EMAIL),
    value: Scope.EMAIL,
    description: "Access to email addresses",
    consentDescription: "Access your email address"
  },
  {
    label: cap(Scope.CONNECTIONS),
    value: Scope.CONNECTIONS,
    description: "Access to connections; e.g. Discord",
    consentDescription: "Access your linked connections, e.g. Discord"
  },
  {
    label: "Offline access",
    value: Scope.OFFLINE_ACCESS,
    description: "Allow refresh tokens to keep access after the initial sign-in",
    consentDescription: "Keep access while you are away until you revoke it"
  }
] as const;

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export { Scope, scopes };
