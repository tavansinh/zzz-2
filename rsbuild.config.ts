import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  html: {
    title: '4K Premium | Mua tài khoản Netflix 4K UHD giá rẻ, giao ngay',
    meta: {
      description:
        'Mua tài khoản Netflix 4K UHD giá rẻ nhất thị trường. Giao ngay qua email, bảo hành 1 đổi 1, hỗ trợ 24/7. Xem phim chất lượng cao không giới hạn.',
      'og:title': '4K Premium | Mua tài khoản Netflix 4K UHD giá rẻ, giao ngay',
      'og:description':
        'Mua tài khoản Netflix 4K UHD giá rẻ nhất thị trường. Giao ngay qua email, bảo hành 1 đổi 1, hỗ trợ 24/7.',
      'og:image': '/og-image.png',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': '4K Premium | Mua tài khoản Netflix 4K UHD giá rẻ',
      'twitter:description':
        'Mua tài khoản Netflix 4K UHD giá rẻ nhất thị trường. Giao ngay qua email, bảo hành 1 đổi 1.',
      'twitter:image': '/og-image.png',
    },
    favicon: './public/favicon.png',
  },
  source: {
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        process.env.SUPABASE_PUBLISHABLE_KEY,
      ),
      'process.env.MESSENGER_URL': JSON.stringify(process.env.MESSENGER_URL),
      'process.env.TELEGRAM_URL': JSON.stringify(process.env.TELEGRAM_URL),
    },
  },
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.[jt]sx?$/,
      exclude: [/[\\/]node_modules[\\/]/],
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
  ],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: ['@tailwindcss/postcss'],
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
