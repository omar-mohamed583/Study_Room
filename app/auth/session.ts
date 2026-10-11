const API_URL = "http://localhost:1337/api";

let accessToken: string | null = null;
let inFlight: Promise<string | null> | null = null;
const listeners = new Set<() => void>();

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  if (token === accessToken) return;
  accessToken = token;
  listeners.forEach((l) => l());
}

export function onTokenChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function refreshSession(): Promise<string | null> {
  inFlight ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return (data?.jwt as string | undefined) ?? null;
    })
    .catch(() => null)
    .then((jwt) => {
      setAccessToken(jwt);
      return jwt;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export async function ensureSession(): Promise<string | null> {
  return accessToken ?? await refreshSession();
}
