// src/lib/apiClient.ts

export class ApiError extends Error {
  public status: number;
  public body: unknown | null;

  constructor(status: number, message: string, body: unknown | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => Promise<string | null> | string | null;
  getCommonParams?: () => Record<string, unknown>;
  /** 默认超时时间（毫秒），可被每次请求覆盖 */
  timeoutMs?: number;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;
  private getCommonParams: () => Record<string, unknown>;
  private defaultTimeoutMs: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? "";
    this.getToken =
      typeof config.getToken === "function"
        ? () => Promise.resolve(config.getToken!())
        : async () => null;
    this.getCommonParams = config.getCommonParams ?? (() => ({}));
    this.defaultTimeoutMs = config.timeoutMs ?? 0; // 0 表示无超时
  }

  private async request<T>(
    url: string,
    init: RequestInit = {},
    timeoutMs?: number,
  ): Promise<T> {
    const token = await this.getToken();
    const commonParams = this.getCommonParams();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let finalUrl = this.baseUrl + url;
    if (
      (!init.method || init.method.toUpperCase() === "GET") &&
      Object.keys(commonParams).length > 0
    ) {
      const qp = new URLSearchParams(commonParams as any).toString();
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + qp;
    }

    // 处理超时／取消逻辑
    let signal: AbortSignal | undefined = init.signal;
    const effectiveTimeout = timeoutMs ?? this.defaultTimeoutMs;

    if (effectiveTimeout > 0) {
      if ("timeout" in AbortSignal) {
        // 如果运行环境支持 AbortSignal.timeout()
        signal = AbortSignal.timeout(effectiveTimeout);
      } else {
        // 备选方案：使用 AbortController + setTimeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, effectiveTimeout);
        // 如果已有 signal，则在该 signal 被 abort 时也 abort controller
        if (init.signal) {
          init.signal.addEventListener(
            "abort",
            () => controller.abort(init.signal!.reason),
            { signal: controller.signal },
          );
        }
        signal = controller.signal;

        // 清理定时器
        init = {
          ...init,
          signal,
        };
        try {
          const response = await fetch(finalUrl, {
            ...init,
            headers,
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            let body: any = null;
            try {
              body = await response.json();
            } catch {}
            const message =
              body?.message ??
              response.statusText ??
              `HTTP error ${response.status}`;
            throw new ApiError(response.status, message, body);
          }
          const data = await response.json();
          return data as T;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      }
    }

    // 如果没有超时需求或已由信号处理
    const response = await fetch(finalUrl, {
      ...init,
      headers,
      signal,
    });
    if (!response.ok) {
      let body: any = null;
      try {
        body = await response.json();
      } catch {}
      const message =
        body?.message ?? response.statusText ?? `HTTP error ${response.status}`;
      throw new ApiError(response.status, message, body);
    }
    const data = await response.json();
    return data as T;
  }

  public get<
    T = unknown,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(url: string, params?: P, timeoutMs?: number): Promise<T> {
    const urlWithParams = params
      ? `${url}?${new URLSearchParams(params as any).toString()}`
      : url;
    return this.request<T>(urlWithParams, { method: "GET" }, timeoutMs);
  }

  public post<T = unknown, P = unknown>(
    url: string,
    body?: P,
    timeoutMs?: number,
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      timeoutMs,
    );
  }

  public put<T = unknown, P = unknown>(
    url: string,
    body?: P,
    timeoutMs?: number,
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      timeoutMs,
    );
  }

  public delete<
    T = unknown,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(url: string, params?: P, timeoutMs?: number): Promise<T> {
    const urlWithParams = params
      ? url + "?" + new URLSearchParams(params as any).toString()
      : url;
    return this.request<T>(urlWithParams, { method: "DELETE" }, timeoutMs);
  }
}

export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  getToken: async () => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  },
  getCommonParams: () => {
    return { lang: "en-US" };
  },
  timeoutMs: 10000, // 默认超时 10 秒
});
