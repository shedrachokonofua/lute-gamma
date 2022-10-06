const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["cls-rtracer"] = path.resolve(
        __dirname,
        "shims/cls-rtracer.js"
      );
    }

    return config;
  },
};

module.exports = nextConfig;
