import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["terminal.local"],
  turbopack: { root: process.cwd() },
};
export default config;
