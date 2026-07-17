import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async () => {
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
        '/api/login': {
          target: process.env.VITE_LOGIN_API_URL || 'http://localhost:3000/login',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/login/, '')
        },
        '/api/whatsapp': {
          target: process.env.VITE_WHATSAPP_WEBHOOK_URL || 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/whatsapp/, ''),
          configure: (proxy: any, options: any) => {
            proxy.on('error', (err: any, req: any, res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        },
        '/api/chat-list': {
          target: 'https://gowa-abi8zeomv0pl.cgk-pro.sumopod.my.id',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/chat-list/, '/chats'),
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              const username = process.env.GOWA_USERNAME || 'cfj85Dr8'
              const password = process.env.GOWA_PASSWORD || 'MHpPiJM5IsjlurFdkbAUmuXo'
              proxyReq.setHeader('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)
            })
          }
        },
        '/api/chat-detail': {
          target: 'https://gowa-abi8zeomv0pl.cgk-pro.sumopod.my.id',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/chat-detail/, '/chat'),
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              const username = process.env.GOWA_USERNAME || 'cfj85Dr8'
              const password = process.env.GOWA_PASSWORD || 'MHpPiJM5IsjlurFdkbAUmuXo'
              proxyReq.setHeader('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)
            })
          }
        },
        '/leads': {
          target: process.env.VITE_LEADS_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/leads/, ''),
          configure: (proxy: any, options: any) => {
            proxy.on('error', (err: any, req: any, res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        },
        '/api/takeover': {
          target: process.env.VITE_TAKEOVER_WEBHOOK_URL || 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/takeover/, ''),
          configure: (proxy: any, options: any) => {
            proxy.on('error', (err: any, req: any, res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  }
})
