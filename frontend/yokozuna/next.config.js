// next.config.js
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  typescript: {
    // Enable TypeScript support
    ignoreBuildErrors: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 1. Cesium static assets
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Workers'), to: 'public/cesium/Workers' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/ThirdParty'), to: 'public/cesium/ThirdParty' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Assets'), to: 'public/cesium/Assets' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Widgets'), to: 'public/cesium/Widgets' },
        ],
      }),
      new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify('/cesium') })
    );

    // Handle WASM files if you're using them
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

module.exports = nextConfig;
