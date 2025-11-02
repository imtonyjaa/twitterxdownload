/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const nextConfig = {
  env: {
    APP_VERSION: packageJson.version
  },
  experimental: {
    forceSwcTransforms: true,
  },
  reactStrictMode: false
}

export default nextConfig