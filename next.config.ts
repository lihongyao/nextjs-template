import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */

  reactCompiler: true,
  reactStrictMode: false,
  experimental: {
    viewTransition: true,
  },
  // seems to interfere with view transitions during `next dev`
  devIndicators: false,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
