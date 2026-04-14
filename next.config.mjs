/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  ...(process.env.MOBILE_BUILD
    ? {
        output: 'export',
        distDir: 'out',
      }
    : {}),
};

export default nextConfig;