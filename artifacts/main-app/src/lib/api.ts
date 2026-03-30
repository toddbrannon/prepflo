const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const TOKEN_KEY = "pf_token";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace("/login");
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(typeof err["error"] === "string" ? err["error"] : `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown) => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown) => request<T>("PUT",    path, body),
  delete: <T>(path: string)               => request<T>("DELETE", path),
};
