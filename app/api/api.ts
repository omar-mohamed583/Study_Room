const API_URL = "http://localhost:1337/api";

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = localStorage.getItem("jwt");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };


  if (token) {
    console.log("Found Token!!")
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Something went wrong");
  }

  return data;
}
