const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=UTF-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ],
      },
    ]
  },
});
