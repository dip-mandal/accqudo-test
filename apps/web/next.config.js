/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'accqudo.com',
    'www.accqudo.com',
    '*.accqudo.com',
  ],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.accqudo.com/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;