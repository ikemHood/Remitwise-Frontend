/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// Keep legacy `/api/*` routes working as v1 to avoid breaking existing clients.
// When v2 is introduced, add a new `/api/v2/*` namespace and update rewrites as needed.
const rewrites = async () => {
  return [
    {
      source: '/api/:path*',
      destination: '/api/v1/:path*',
    },
  ]
}

module.exports = {
  ...nextConfig,
  rewrites,
}

