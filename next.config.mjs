/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports (reduces bundle size)
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack configuration for better build performance
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        mongoose: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
