<script lang="ts">
import { defineComponent } from 'vue'
import {
  RefreshCw
} from 'lucide-vue-next'

export default defineComponent({
  name: 'SyncTab',
  components: {
    RefreshCw
  },
  props: {
    isSyncing: {
      type: Boolean,
      required: true
    }
  },
  emits: ['triggerSync'],
  data() {
    return {
      syncData: [
        { id: 1, type: 'Order', name: 'Aluminium Sheets', status: 'Synced', time: '2m ago' },
        { id: 2, type: 'Lead', name: 'PT Sumber', status: 'Pending', time: '8m ago' },
        { id: 3, type: 'Message', name: 'WhatsApp blast', status: 'Synced', time: '15m ago' }
      ]
    }
  },
  methods: {
    handleTriggerSync() {
      this.$emit('triggerSync')
    }
  }
})
</script>

<template>
  <div class="space-y-6"><div><h2 class="text-2xl font-bold">Sync Logs</h2><p class="text-sm text-gray-500">Monitor synchronization activity.</p></div><div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold">Data Synchronization Logs</h3>
        <p class="text-sm text-gray-500">History of data movements between Delica and external systems.</p>
      </div>
      <button
        @click="handleTriggerSync"
        :disabled="isSyncing"
        class="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
      >
        <RefreshCw :size="14" :class="{ 'animate-spin': isSyncing }" />
        Refresh
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left">
        <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th class="px-6 py-3">ID</th>
            <th class="px-6 py-3">Type</th>
            <th class="px-6 py-3">Entity Name</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Last Sync</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(item, idx) in [...syncData, ...syncData]" :key="idx" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-xs text-gray-400 font-mono">#{{ item.id }}{{ idx }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.type }}</td>
            <td class="px-6 py-4 text-sm font-semibold">{{ item.name }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" :class="item.status === 'Synced' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                {{ item.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ item.time }}</td>
            <td class="px-6 py-4 text-right">
              <button class="text-sm font-medium text-sky-600 hover:underline">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div></div>
</template>
