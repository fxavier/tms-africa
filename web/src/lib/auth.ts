import type { UserResponseDto } from "@/lib/contracts";

const ACCESS_TOKEN_KEY = "tms.access_token";
const REFRESH_TOKEN_KEY = "tms.refresh_token";
const EXPIRES_AT_KEY = "tms.expires_at";
const PKCE_VERIFIER_KEY = "tms.pkce_verifier";
const STATE_KEY = "tms.oauth_state";
const USER_KEY = "tms.user";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8081";
const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "tms";
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "tms-web";

function redirectUri() {
  if (process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI) return process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI;
  if (typeof window === "undefined") return "http://localhost:3000/auth/callback";
  return `${window.location.origin}/auth/callback`;
}

function tokenEndpoint() {
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
}

function revokeEndpoint() {
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/revoke`;
}

function authEndpoint() {
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`;
}

function registrationEndpoint() {
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/registrations`;
}

function logoutEndpoint() {
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`;
}

function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ("0" + (byte % 36).toString(36)).slice(-1)).join("");
}

function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  return crypto.subtle.digest("SHA-256", encoded);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiry() {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(EXPIRES_AT_KEY) ?? "0");
}

export function getUserDisplayName() {
  const user = getStoredUser();
  if (!user) return null;
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const token = getAccessToken();
  const expiresAt = getAccessTokenExpiry();
  return Boolean(token && expiresAt > Date.now() + 30_000);
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken() {
  if (typeof window === "undefined") return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    });

    const response = await fetch(tokenEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const tokenSet = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenSet.access_token);
    if (tokenSet.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokenSet.refresh_token);
    localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + tokenSet.expires_in * 1000));
    return tokenSet.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function ensureValidAccessToken() {
  const token = getAccessToken();
  if (!token) return null;
  if (getAccessTokenExpiry() > Date.now() + 30_000) return token;
  return refreshAccessToken();
}

export function getStoredUser(): UserResponseDto | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponseDto;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserResponseDto) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loginWithKeycloak() {
  const verifier = randomString(96);
  const state = randomString(32);
  const challenge = base64UrlEncode(await sha256(verifier));

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: redirectUri(),
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  window.location.assign(`${authEndpoint()}?${params.toString()}`);
}

export async function registerWithKeycloak() {
  const verifier = randomString(96);
  const state = randomString(32);
  const challenge = base64UrlEncode(await sha256(verifier));

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: redirectUri(),
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  window.location.assign(`${registrationEndpoint()}?${params.toString()}`);
}

export async function completeKeycloakLogin(code: string, state: string | null) {
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  if (!verifier || !state || state !== expectedState) {
    throw new Error("Estado OAuth invalido. Reinicie a sessao.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
  });

  const response = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Falha ao trocar o codigo OAuth por tokens.");
  }

  const tokenSet = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  localStorage.setItem(ACCESS_TOKEN_KEY, tokenSet.access_token);
  if (tokenSet.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokenSet.refresh_token);
  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + tokenSet.expires_in * 1000));
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

async function revokeRefreshToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: clientId,
    token: refreshToken,
    token_type_hint: "refresh_token",
  });

  await fetch(revokeEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function logoutFromKeycloak() {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await revokeRefreshToken(refreshToken);
    } catch {
      // Continue with local cleanup and Keycloak end-session redirect.
    }
  }

  clearSession();

  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: typeof window === "undefined" ? "http://localhost:3000/login" : `${window.location.origin}/login`,
  });
  window.location.assign(`${logoutEndpoint()}?${params.toString()}`);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}
