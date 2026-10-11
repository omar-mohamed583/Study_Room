import { getAccessToken, refreshSession } from "~/auth/session";

const API_URL = "http://localhost:1337/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  canRetry = true,
) {
  const headers = new Headers(options.headers);

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && canRetry && !path.startsWith("/auth/")) {
    const newToken = await refreshSession();
    if (newToken) return apiFetch(path, options, false);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error?.message ?? response.statusText,
    );
  }

  return data;
}
