import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["md-to-pdf", "puppeteer"],
};

export default nextConfig;
