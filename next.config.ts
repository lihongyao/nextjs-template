import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// -- 加载环境变量
const APP_ENV = process.env.APP_ENV || "dev";
const envFile = `.env.${APP_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  console.log(`👉 Loading environment variables from ${envFile}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`⚠️ Environment file ${envFile} not found, fallback to defaults`);
}

// -- Next.js 配置
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  images: {
    remotePatterns: [],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
