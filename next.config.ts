import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Already the default in the App Router; written out so it is visible.
  // In development, Strict Mode renders components twice and runs each effect
  // setup -> cleanup -> setup, to expose impure renders and missing cleanups.
  reactStrictMode: true,
};

export default nextConfig;
