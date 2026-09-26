import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const pagesBase = '/fruit-of-the-spirit/'

export default defineConfig(({ command, isPreview }) => {
  const base = process.env.VITE_BASE_PATH ?? (command === 'serve' && !isPreview ? '/' : pagesBase)

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: 'Fruit of the Spirit',
          short_name: 'Fruit of the Spirit',
          description: 'Read Scripture and keep a private practice of the nine fruits on this device.',
          theme_color: '#0c0b09',
          background_color: '#0c0b09',
          id: base,
          display: 'standalone',
          scope: base,
          start_url: base,
          lang: 'en',
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2,webmanifest,json}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: /\/scripture\/.+\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'scripture',
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  }
})
