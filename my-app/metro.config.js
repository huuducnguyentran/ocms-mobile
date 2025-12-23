// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore problematic directories in node_modules
config.watchFolders = config.watchFolders || [];
config.resolver = config.resolver || {};
config.resolver.blockList = config.resolver.blockList || [];

// Add watcher ignore patterns to prevent ENOENT errors
config.watcher = {
  ...config.watcher,
  ignored: [
    ...(config.watcher?.ignored || []),
    '**/node_modules/@tybys/wasm-util/lib/mjs/**',
    '**/node_modules/@tybys/**',
  ],
};

module.exports = config;
