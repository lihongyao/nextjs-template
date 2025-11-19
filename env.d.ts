// -- 客户端环境变量
interface ClientEnv {
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_BRAND_NAME: string;
}

// -- 服务端环境变量
interface ServerEnv {
  APP_ENV: "dev" | "stage" | "prod";
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnv, ServerEnv {
      // ...
    }
  }
}

export {};
