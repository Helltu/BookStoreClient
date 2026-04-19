/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*' // Проксируем запросы на бэкенд
      }
    ];
  }
};

export default nextConfig;