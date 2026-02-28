import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdf-parse', 'xlsx', 'pg', 'pg-native', '@anthropic-ai/sdk'],
}

export default nextConfig
