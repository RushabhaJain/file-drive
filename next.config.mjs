/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "fantastic-meerkat-237.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
