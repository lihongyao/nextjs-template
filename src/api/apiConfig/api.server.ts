// api.server.ts
import { baseFetch, type FetchOptions } from "./baseFetch";

export function getTokenFromHeaders(headers?: Headers) {
  if (!headers) return null;
  const cookie = headers.get("cookie") || "";
  const match = cookie.match(/AUTHORIZATION_TOKEN=([^;]+)/);
  return match ? JSON.parse(decodeURIComponent(match[1])) : null;
}

export async function serverFetch<T>(
  url: string,
  options: FetchOptions = {},
  headers?: Headers,
) {
  const token = getTokenFromHeaders(headers)?.token;
  const h = new Headers(options.headers);
  if (token) h.set("Authorization", `Bearer ${token}`);
  options.headers = h;

  return baseFetch<T>(url, options);
}
