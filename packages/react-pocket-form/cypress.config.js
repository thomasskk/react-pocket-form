module.exports = {
  viewportWidth: 1000,
  viewportHeight: 1000,
  video: false,
  env: {
    reactDevtools: true,
  },
  experimentalFetchPolyfill: true,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
}
