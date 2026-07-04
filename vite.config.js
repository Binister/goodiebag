import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/goodiebag/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*'],
      manifest: {
        name: 'Politie Afluistercentrale',
        short_name: 'Afluistercentrale',
        description: 'Politiespeurtocht-app voor kinderfeestjes',
        theme_color: '#0b1d26',
        background_color: '#0b1d26',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/goodiebag/',
        scope: '/goodiebag/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,mp4}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      }
    })
  ]
})
