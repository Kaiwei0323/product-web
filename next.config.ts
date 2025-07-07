/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,

  async headers() {
    return [
      {
        source: '/(.*)', // Applies to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
  
  async redirects() {
      return [
          {
              source: '/CVS/:path*',
              destination: '/404',
              permanent:false,
          },
      ];
  },
}

module.exports = nextConfig;

