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
  async headers() {
    return [
      {
        // SharedArrayBuffer required by onnxruntime-web (used by @imgly/background-removal)
        source: '/herramientas/quitar-fondo',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy',  value: 'credentialless' },
        ],
      },
    ];
  },
};

export default nextConfig;
