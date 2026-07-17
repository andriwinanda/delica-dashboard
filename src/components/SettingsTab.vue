<script lang="ts">
import { defineComponent } from 'vue'
import { getOriginalWhatsAppWebhookUrl, getOriginalLeadsApiUrl, getOriginalTakeoverWebhookUrl } from '@/utils/env'

export default defineComponent({
  name: 'SettingsTab',
  methods: {
    getOriginalWhatsAppWebhookUrl,
    getOriginalLeadsApiUrl,
    getOriginalTakeoverWebhookUrl
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6"><div><h2 class="text-2xl font-bold">Settings</h2><p class="text-sm text-gray-500">Configure application settings.</p></div>
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div class="mb-6">
        <h3 class="text-lg font-semibold">Environment Configuration</h3>
        <p class="text-sm text-gray-500">n8n webhook URLs configured via environment variables.</p>
      </div>
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp Webhook URL</label>
          <div class="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            {{ getOriginalWhatsAppWebhookUrl() || 'Not configured' }}
          </div>
          <p class="text-xs text-gray-500 mt-2">Environment variable: VITE_WHATSAPP_WEBHOOK_URL</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Leads API Endpoint</label>
          <div class="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            {{ getOriginalLeadsApiUrl() || 'Not configured' }}
          </div>
          <p class="text-xs text-gray-500 mt-2">Environment variable: VITE_LEADS_API_URL</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Message Takeover Webhook</label>
          <div class="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            {{ getOriginalTakeoverWebhookUrl() || 'Not configured' }}
          </div>
          <p class="text-xs text-gray-500 mt-2">Environment variable: VITE_TAKEOVER_WEBHOOK_URL</p>
        </div>
      </div>
    </div>
  </div>
</template>
