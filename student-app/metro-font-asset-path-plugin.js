module.exports = function normalizeFontAssetPath(asset) {
  if (asset.type !== "ttf") {
    return asset;
  }

  const match = asset.httpServerLocation.match(/\?unstable_path=([^&]+)/);
  if (!match || decodeURIComponent(match[1]) !== "./assets/fonts") {
    return asset;
  }

  // Avoid double-encoding this directory in native font download URLs.
  return {
    ...asset,
    httpServerLocation: "/assets/./assets/fonts",
  };
};
