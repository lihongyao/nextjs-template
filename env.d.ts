// -- 客户端环境变量
interface ClientEnv {
  NEXT_PUBLIC_HOST: string;
  NEXT_PUBLIC_VERSION: string;
}

// -- 服务端环境变量
interface ServerEnv {
  HOST: string;
  VERSION: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnv, ServerEnv {
      NODE_ENV: "development" | "production";
      APP_ENV: "dev" | "qa" | "prod";
    }
  }
}

export {};
