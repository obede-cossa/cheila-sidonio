/** @type {import('next').NextConfig} */
const nextConfig = {
  // `typescript.ignoreBuildErrors` was removed on purpose: it let type errors
  // ship to production. Fix the errors instead of muting the compiler.
  images: {
    // Was `unoptimized: true`, which shipped full-size Unsplash JPEGs.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      // The couple pastes arbitrary store URLs into image_url, so any https
      // host has to be allowed. Trade-off: this makes /_next/image a public
      // image proxy. If that bothers you, drop this line and upload images to
      // Supabase Storage instead, then whitelist only that hostname.
      { protocol: 'https', hostname: '**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Avoids pulling the whole icon set into the client bundle.
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
