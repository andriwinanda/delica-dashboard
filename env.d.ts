/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_WEBHOOK_URL: string
  readonly VITE_LEADS_API_URL: string
  readonly VITE_TAKEOVER_WEBHOOK_URL: string
  readonly VITE_LOGIN_API_URL: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
