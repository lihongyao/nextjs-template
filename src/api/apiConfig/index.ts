export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export interface TokenData {
  token: string;
  refreshToken: string;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

// ----------------------
// 全局刷新控制
// ----------------------
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * 获取 token
 */
function getToken(serverHeaders?: Headers): TokenData | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("AUTHORIZATION_TOKEN");
    return token ? JSON.parse(token) : null;
  } else if (serverHeaders) {
    const cookie = serverHeaders.get("cookie") || "";
    const match = cookie.match(/AUTHORIZATION_TOKEN=([^;]+)/);
    if (match) return JSON.parse(decodeURIComponent(match[1]));
  }
  return null;
}

function setToken(tokenData: TokenData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("AUTHORIZATION_TOKEN", JSON.stringify(tokenData));
  }
}

function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("AUTHORIZATION_TOKEN");
  }
}

async function refreshToken(): Promise<string> {
  const currentToken = getToken();
  if (!currentToken?.refreshToken) throw new Error("No refresh token available");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentToken.refreshToken }),
    });
    const json: ApiResponse<TokenData> = await res.json();
    if (json.code !== 0 && json.code !== 200) throw new Error(json.msg || "刷新 token 失败");
    setToken(json.data);
    return json.data.token;
  } catch (err) {
    clearToken();
    throw err;
  }
}

function createTimeoutController(timeout = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return { controller, clear: () => clearTimeout(id) };
}

export class ApiError extends Error {
  code: number;
  data?: unknown;
  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries) throw err;
      const delay = 300 * 2 ** i;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Should not reach here");
}

/**
 * apiFetch 封装
 */
export async function apiFetch<T = unknown>(url: string, options: FetchOptions = {}, retry = 0, isLogin = false, serverHeaders?: Headers): Promise<T> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  const timeout = options.timeout ?? 60000;
  delete options.timeout;

  const token = getToken(serverHeaders)?.token || "";

  if (isLogin && !token) throw new ApiError(10001, "请登录");

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  options.headers = headers;

  const { controller, clear } = createTimeoutController(timeout);
  options.signal = controller.signal;

  try {
    const res = await fetchWithRetry(fullUrl, options, retry);
    clear();

    const data: ApiResponse<T> = await res.json();

    // ----------------------
    // token 过期
    // ----------------------
    if (data.code === 10002) {
      // 如果刷新中，等待 refreshPromise
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      headers.set("Authorization", `Bearer ${newToken}`);
      return apiFetch<T>(url, { ...options, headers }, retry, isLogin, serverHeaders);
    }

    // ----------------------
    // 未登录
    // ----------------------
    if (data.code === 401) {
      return Promise.reject(new ApiError(data.code, data.msg));
    }

    // ----------------------
    // 其他业务错误
    // ----------------------
    if (data.code !== 0 && data.code !== 200) {
      throw new ApiError(data.code, data.msg, data.data);
    }

    return data.data;
  } catch (err: unknown) {
    clear();
    if (err.name === "AbortError") throw new ApiError(408, "请求超时");
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Network Error");
  }
}
