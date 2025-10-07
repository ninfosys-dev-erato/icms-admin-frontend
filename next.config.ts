import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@carbon/react', '@carbon/icons-react', '@carbon/ibm-products']
  },
  eslint: {
    // Temporarily ignore ESLint errors during build to allow incremental refactors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15
};

export default withNextIntl(nextConfig);
