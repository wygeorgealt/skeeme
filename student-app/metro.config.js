const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  if (!resolver.assetExts.includes('riv')) {
    resolver.assetExts.push('riv');
  }
  if (!resolver.assetExts.includes('woff2')) {
    resolver.assetExts.push('woff2');
  }

  config.transformer = {
    ...transformer,
    assetPlugins: [
      ...(transformer.assetPlugins ?? []),
      require.resolve("./metro-font-asset-path-plugin"),
    ],
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
  };

  return withNativeWind(config, { input: "./global.css" });
})();