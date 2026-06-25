const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('riv')) {
  config.resolver.assetExts.push('riv');
}

module.exports = withNativeWind(config, { input: "./global.css" });