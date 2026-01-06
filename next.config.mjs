/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.in',
            },
        ],
    },
    // Compression
    compress: true,
    // Optimisation production
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    // Optimisation des fonts
    optimizeFonts: true,
    // Minification
    swcMinify: true,
};

export default nextConfig;
