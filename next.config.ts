import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: [
    'rc-util',
    '@ant-design',
    'antd',
    'rc-pagination',
    'rc-picker'
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false, // Permite processar arquivos sem extensões explícitas
      },
    });

    return config;
  },
};

export default nextConfig;
