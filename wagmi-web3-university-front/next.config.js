/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['supports-color', 'debug'],
    experimental: {
        esmExternals: 'loose', // 或 true
    },
}

module.exports = nextConfig
