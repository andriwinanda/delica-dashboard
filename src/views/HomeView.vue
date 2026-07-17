<script lang="ts">
import { defineComponent } from 'vue'
import axiosHelper, { clearAuthSession } from '@/utils/axiosHelper'
import SidebarItem from '@/components/SidebarItem.vue'
import StatCard from '@/components/StatCard.vue'
import OverviewTab from '@/components/OverviewTab.vue'
import WhatsAppTab from '@/components/WhatsAppTab.vue'
import LeadsTab from '@/components/LeadsTab.vue'
import SyncTab from '@/components/SyncTab.vue'
import BranchesTab from '@/components/BranchesTab.vue'
import CustomerTab from '@/components/CustomerTab.vue'
import QuotationTab from '@/components/QuotationTab.vue'
import LocationTab from '@/components/LocationTab.vue'
import { getLeadsApiUrl } from '@/utils/env'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FileText,
  LogOut,
  MessageSquare,
  Menu,
  Plus,
  RefreshCw,
  Users,
  X
} from 'lucide-vue-next'

const tabTitles = {
  overview: 'Overview',
  whatsapp: 'WhatsApp Messages', customers: 'Customers', quotations: 'Quotations', branches: 'Branches', locations: 'Locations',
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
    BranchesTab,
    CustomerTab,
    QuotationTab,
    LocationTab,
    LayoutDashboard,
    MapPin,
    LogOut,
    MessageSquare,
    Menu,
    Plus,
    RefreshCw,
    Users,
    X
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
        // { id: 'sync', label: 'Sync', icon: RefreshCw },
        // { id: 'settings', label: 'Settings', icon: Plus },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'quotations', label: 'Quotations', icon: FileText },
        { id: 'branches', label: 'Branches', icon: Building2 },
        { id: 'locations', label: 'Locations', icon: MapPin }
      ]
    }
  },
  computed: {
    tabTitle(): string {
      return tabTitles[this.activeTab as keyof typeof tabTitles] ?? 'Overview'
    }
  },
  methods: {
    handleChangeTab(tab: string) {
      this.activeTab = tab
    },
    handleLogout() {
      clearAuthSession()
      this.$router.replace('/login')
    }
  }
})
</script>

<template>
  <div class="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
    <aside
      :class="['bg-white border-r border-gray-200 flex flex-col z-20 transition-all duration-300', isSidebarOpen ? 'w-[260px]' : 'w-[80px]']">
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
        <SidebarItem v-for="item in navItems" :key="item.id" :icon="item.icon" :label="item.label"
          :active="activeTab === item.id" @click="activeTab = item.id" :is-open="isSidebarOpen" />
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div :class="['flex items-center gap-3', isSidebarOpen ? '' : 'justify-center']">
          <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div v-if="isSidebarOpen" class="flex flex-1 flex-col min-w-0">
            <span class="text-sm font-medium truncate">Admin User</span>
            <span class="text-xs text-gray-500 truncate">Delica Aluminium</span>
          </div>
          <button @click="handleLogout"
            class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900" title="Sign out"
            aria-label="Sign out">
            <LogOut :size="17" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-auto p-4 md:p-8">
      <transition name="fade" mode="out-in">
        <div :key="activeTab">
          <OverviewTab v-if="activeTab === 'overview'" />
          <WhatsAppTab v-else-if="activeTab === 'whatsapp'" />
          <LeadsTab v-else-if="activeTab === 'leads'" />
          <SyncTab v-else-if="activeTab === 'sync'" />
          <CustomerTab v-else-if="activeTab === 'customers'" />
          <QuotationTab v-else-if="activeTab === 'quotations'" />
          <BranchesTab v-else-if="activeTab === 'branches'" />
          <LocationTab v-else-if="activeTab === 'locations'" />
        </div>
      </transition>
    </main>
  </div>
</template>
