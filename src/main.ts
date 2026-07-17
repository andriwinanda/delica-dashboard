import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import './assets/base.css'

// Import and save environment variables to session storage
const envVars = {
  whatsappWebhookUrl: import.meta.env.VITE_WHATSAPP_WEBHOOK_URL,
  leadsApiUrl: import.meta.env.VITE_LEADS_API_URL,
  takeoverWebhookUrl: import.meta.env.VITE_TAKEOVER_WEBHOOK_URL,
  loginApiUrl: import.meta.env.VITE_LOGIN_API_URL
}

// Save to session storage for runtime access
sessionStorage.setItem('n8n_env_vars', JSON.stringify(envVars))

const app = createApp(App)

app.use(router)

app.mount('#app')
