import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const config: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["terminal.local"],
  turbopack: { root: process.cwd() },
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? process.env.PAGES_BASE_PATH || "" : "",
  trailingSlash: isGitHubPages,
};

export default config;
