// next.config.js
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true,
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

    // 2. WebAssembly support for environmental intelligence engines
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Handle WebAssembly files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    
    // Ignore WebAssembly files in server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // 3. Handle Three.js and React Three Fiber optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      three: path.resolve('./node_modules/three'),
    };

    // 4. Optimize for large datasets and 3D rendering
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            chunks: 'all',
          },
        },
      },
    };

    // Handle missing three/webgpu module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'three/webgpu': false,
      'three/tsl': false,
      'three/nodes': false,
    };

    // Add alias for three/webgpu to provide empty module
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/webgpu': require.resolve('./src/utils/webgpu-mock.js'),
      'three/tsl': false,
      'three/nodes': false,
    };

    return config;
  },
};

module.exports = nextConfig;
