const API_URL = "http://localhost:1337/api";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super();
    this.message = message;
    this.status = status;
  }
}

export async function apiFetch(endpoint: string, options: any = {}, isRetry: boolean = false) {
  const token = localStorage.getItem("jwt");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.warn(headers);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  console.warn("Data ", data);

  if (!response.ok) {

    if (response.status === 401 && !isRetry && endpoint !== "/auth/refresh") {
      const refreshData = await apiFetch(
        "/auth/refresh",
        { method: "POST" },
        true,
      );

      localStorage.setItem("jwt", refreshData.jwt);
      return apiFetch(endpoint, options, true);
    }

    throw new ApiError(
      data?.error?.status,
      data?.error?.message || "Something went wrong",
    );

  }

  return data;
}
