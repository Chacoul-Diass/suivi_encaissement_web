/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  // Ajout des configurations pour améliorer la stabilité en production
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimisation des images
  images: {
    domains: ['*'],
    unoptimized: false,
  },
};

module.exports = nextConfig;
