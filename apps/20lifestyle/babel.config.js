module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Ensure workspace packages are transpiled by Babel in EAS/Metro
    plugins: [],
  };
};


