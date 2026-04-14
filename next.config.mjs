/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['nodemailer', '@imgly/background-removal'],
  webpack: (config) => {
    // Fix for ESM packages (onnxruntime-web / @imgly) that use import.meta.url
    config.module.rules.unshift({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
