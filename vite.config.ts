import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const tailwindcss = (await import('@tailwindcss/vite')).default

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        '/api/chat-list': {
          target: env.VITE_GOWA_BASE_URL || 'https://gowa-abi8zeomv0pl.cgk-pro.sumopod.my.id',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/chat-list/, '/chats'),
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              const username = env.VITE_GOWA_USERNAME
              const password = env.VITE_GOWA_PASSWORD
              proxyReq.setHeader('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)
              proxyReq.setHeader('X-Device-Id', `6285111528585@s.whatsapp.net`)
            })
          }
        },
        '/api/chat-detail': {
          target: env.VITE_GOWA_BASE_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/chat-detail/, '/chat'),
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              const username = env.VITE_GOWA_USERNAME
              const password = env.VITE_GOWA_PASSWORD
              proxyReq.setHeader('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)
              proxyReq.setHeader('X-Device-Id', `6285111528585@s.whatsapp.net`)
            })
          }
        },
      }
    }
  }
})
