<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import SidebarItem from '@/components/SidebarItem.vue'
import StatCard from '@/components/StatCard.vue'
import OverviewTab from '@/components/OverviewTab.vue'
import WhatsAppTab from '@/components/WhatsAppTab.vue'
import LeadsTab from '@/components/LeadsTab.vue'
import SyncTab from '@/components/SyncTab.vue'
import SettingsTab from '@/components/SettingsTab.vue'
import { getLeadsApiUrl } from '@/utils/env'
import {
  LayoutDashboard,
  MessageSquare,
  Menu,
  Plus,
  RefreshCw,
  Users,
  X
} from 'lucide-vue-next'

const tabTitles = {
  overview: 'Overview',
  whatsapp: 'WhatsApp Messages',
  leads: 'Lead Scoring',
  sync: 'Sync Logs',
  settings: 'Settings'
} as const

export default defineComponent({
  name: 'HomeView',
  components: {
    SidebarItem,
    StatCard,
    OverviewTab,
    WhatsAppTab,
    LeadsTab,
    SyncTab,
    SettingsTab
  },
  data() {
    return {
      activeTab: 'overview' as string,
      isSidebarOpen: true,
      isSyncing: false,
      navItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'sync', label: 'Sync', icon: RefreshCw },
        { id: 'settings', label: 'Settings', icon: Plus }
      ],
      messages: [
        { id: 1, recipient: '0512 3456 7890', content: 'Order confirmation sent successfully.', status: 'Delivered', time: 'Just now' },
        { id: 2, recipient: '0812 9876 5432', content: 'Reminder sent to customer.', status: 'Sent', time: '12m ago' },
        { id: 3, recipient: '0856 4321 6789', content: 'Payment link shared.', status: 'Pending', time: '24m ago' }
      ],
      leads: [
        { id: 1, name: 'John Doe', phone: '081234567890', score: 85, label: 'Hot Lead', group: 'High Priority' },
        { id: 2, name: 'Jane Smith', phone: '081298765432', score: 72, label: 'Warm Lead', group: 'Medium Priority' },
        { id: 3, name: 'Bob Johnson', phone: '085612345678', score: 45, label: 'Cold Lead', group: 'Low Priority' }
      ]
    }
  },
  computed: {
    tabTitle(): string {
      return tabTitles[this.activeTab as keyof typeof tabTitles] ?? 'Overview'
    }
  },
  methods: {
    handleTriggerSync() {
      this.isSyncing = true
      setTimeout(() => {
        this.isSyncing = false
      }, 1200)
    },
    async fetchLeads() {
      const leadsUrl = getLeadsApiUrl()

      if (!leadsUrl) {
        console.log('VITE_LEADS_API_URL not configured')
        return
      }

      try {
        const response = await axios.get(leadsUrl)
        this.leads = response.data
      } catch (error: any) {
        console.error('Error fetching leads:', error)

        if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
          console.warn('Network error: Unable to connect to leads API. Using mock data.')
        } else if (error.response) {
          console.error(`API error: ${error.response.status} - ${error.response.statusText}`)
        }
      }
    },
    handleMessageSent(message: any) {
      this.messages.unshift(message)
    },
    handleLeadsUpdated(updatedLeads: any) {
      this.leads = updatedLeads
    },
    handleChangeTab(tab: string) {
      this.activeTab = tab
    }
  },
  mounted() {
    this.fetchLeads()
  }
})
</script>

<template>
  <div class="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
    <aside :class="['bg-white border-r border-gray-200 flex flex-col z-20 transition-all duration-300', isSidebarOpen ? 'w-[260px]' : 'w-[80px]']">
      <div class="p-6 flex items-center justify-between">
        <div v-if="isSidebarOpen" class="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size="18" />
          </div>
          <span>Delica</span>
        </div>
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <X v-if="isSidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4">
        <SidebarItem
          v-for="item in navItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="activeTab === item.id"
          @click="activeTab = item.id"
          :is-open="isSidebarOpen"
        />
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div :class="['flex items-center gap-3', isSidebarOpen ? '' : 'justify-center']">
          <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div v-if="isSidebarOpen" class="flex flex-col min-w-0">
            <span class="text-sm font-medium truncate">Admin User</span>
            <span class="text-xs text-gray-500 truncate">Delica Aluminium</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-auto p-4 md:p-8">
      <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ tabTitle }}</h1>
          <p class="text-gray-500 mt-1">Manage your aluminium business operations and n8n workflows.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="handleTriggerSync"
            :disabled="isSyncing"
            class="px-4 py-2 border border-gray-200 rounded-md flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isSyncing }" />
            {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
          </button>
          <button class="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md flex items-center gap-2 transition-colors">
            <Plus :size="16" />
            New Order
          </button>
        </div>
      </header>

      <transition name="fade" mode="out-in">
        <div :key="activeTab">
          <OverviewTab
            v-if="activeTab === 'overview'"
          />
          <WhatsAppTab
            v-else-if="activeTab === 'whatsapp'"
          />
          <LeadsTab
            v-else-if="activeTab === 'leads'"
           
          />
          <SyncTab
            v-else-if="activeTab === 'sync'"
          
          />
          <SettingsTab v-else-if="activeTab === 'settings'" />
        </div>
      </transition>
    </main>
  </div>
</template>
