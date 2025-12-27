// baseFetch.ts
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
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

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function baseFetch<T>(
  url: string,
  options: FetchOptions = {},
  retry = 0,
): Promise<T> {
  const timeout = options.timeout ?? 60000;
  delete options.timeout;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  options.signal = controller.signal;

  const fetchWithRetry = async (): Promise<Response> => {
    for (let i = 0; i <= retry; i++) {
      try {
        return await fetch(url, options);
      } catch (err) {
        if (i === retry) throw err;
        await new Promise((res) => setTimeout(res, 300 * 2 ** i));
      }
    }
    throw new Error("Should not reach here");
  };

  try {
    const res = await fetchWithRetry();
    clearTimeout(id);
    const json: ApiResponse<T> = await res.json();

    if (json.code !== 0 && json.code !== 200) {
      throw new ApiError(json.code, json.msg, json.data);
    }

    return json.data;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err.name === "AbortError") throw new ApiError(408, "请求超时");
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Network Error");
  }
}
