// api.client.ts
import { ApiError, baseFetch, type FetchOptions } from "./baseFetch";

export interface TokenData {
  token: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

function getTokenFromStorage(): TokenData | null {
  const token = localStorage.getItem("AUTHORIZATION_TOKEN");
  return token ? JSON.parse(token) : null;
}

function setToken(tokenData: TokenData) {
  localStorage.setItem("AUTHORIZATION_TOKEN", JSON.stringify(tokenData));
}

function clearToken() {
  localStorage.removeItem("AUTHORIZATION_TOKEN");
}

async function refreshToken(): Promise<string> {
  const current = getTokenFromStorage();
  if (!current?.refreshToken) throw new ApiError(401, "No refresh token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const json = await res.json();
  if (json.code !== 0 && json.code !== 200) throw new ApiError(json.code, json.msg);
  setToken(json.data);
  return json.data.token;
}

export async function clientFetch<T>(url: string, options: FetchOptions = {}, isLogin = false): Promise<T> {
  let token = getTokenFromStorage()?.token || "";
  if (isLogin && !token) throw new ApiError(10001, "请登录");

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  options.headers = headers;

  try {
    const data = await baseFetch<T>(url, options);
    return data;
  } catch (err: unknown) {
    // token 过期处理
    if (err instanceof ApiError && err.code === 10002) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }
      token = await refreshPromise!;
      headers.set("Authorization", `Bearer ${token}`);
      return clientFetch(url, { ...options, headers }, isLogin);
    }
    throw err;
  }
}
