const API_URL = "http://localhost:1337/api";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super();
    this.message = message;
    this.status = status;
  }
}

export async function apiFetch(
  path: string,
  accessToken: string | null,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  return data;
}
