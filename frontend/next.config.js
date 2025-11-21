/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // 프로덕션 빌드 시 ESLint 에러를 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드 시 TypeScript 에러를 무시
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
