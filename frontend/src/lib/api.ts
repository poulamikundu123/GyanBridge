import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // In Server Components, extract cookie and pass Bearer token
  if (typeof window === "undefined") {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("ayush_session_token")?.value;
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      // In static or build context
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  if (!res.ok) {
    let errorMsg = `API Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || errorMsg;
    } catch {
      // Not json
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
