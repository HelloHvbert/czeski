const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// expo-sqlite na webie (podgląd w przeglądarce) potrzebuje plików .wasm
config.resolver.assetExts.push('wasm');

module.exports = config;
