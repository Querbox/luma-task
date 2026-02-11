import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/luma-task/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Luma Task',
        short_name: 'Luma',
        description: 'Intelligent, calm task manager',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: '/luma-task/',
        start_url: '/luma-task/',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
