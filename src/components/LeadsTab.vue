<script lang="ts">
import { defineComponent } from 'vue'
import axiosHelper from '@/utils/axiosHelper'
import { getLeadsApiUrl } from '@/utils/env'
import {
  CheckCircle2,
  Clock3,
  ChevronDown,
  MapPin,
  MessageCircle,
  RefreshCw,
  Globe,
  MessageCircleMore,
  Users
} from 'lucide-vue-next'
import moment from 'moment'

type LeadStatus = 'new' | 'contacted' | 'closed'

interface Lead {
  id: number | string
  name: string
  phone: string
  score: number
  label: string
  status?: LeadStatus | string
  branch?: string
}

export default defineComponent({
  name: 'LeadsTab',
  components: {
    CheckCircle2,
    Clock3,
    ChevronDown,
    MapPin,
    MessageCircleMore,
    MessageCircle,
    Globe,
    RefreshCw,
    Users
  },
  emits: ['leadsUpdated'],
  data() {
    return {
      moment,
      selectedBranch: 'all',
      branches: ['Jakarta', 'Medan', 'Surabaya'],
      statuses: [
        { key: 'new', label: 'New', description: 'Leads that need follow-up', icon: Clock3, color: 'blue' },
        { key: 'contacted', label: 'Contacted', description: 'Leads already contacted', icon: MessageCircle, color: 'amber' },
        { key: 'closed', label: 'Closed', description: 'Completed leads', icon: CheckCircle2, color: 'emerald' }
      ],
      leads: [
        { id: 1, name: 'John Doe', phone: '081234567890', score: 85, label: 'Hot Lead', status: 'new', branch: 'Jakarta' },
        { id: 2, name: 'Jane Smith', phone: '081298765432', score: 72, label: 'Warm Lead', status: 'contacted', branch: 'Medan' },
        { id: 3, name: 'Bob Johnson', phone: '085612345678', score: 45, label: 'Cold Lead', status: 'closed', branch: 'Surabaya' },
        { id: 4, name: 'Dina Putri', phone: '081377788899', score: 90, label: 'Hot Lead', status: 'new', branch: 'Surabaya' },
        { id: 5, name: 'Rizky Pratama', phone: '082211223344', score: 68, label: 'Warm Lead', status: 'contacted', branch: 'Jakarta' },
        { id: 6, name: 'Siti Rahma', phone: '085266677788', score: 78, label: 'Warm Lead', status: 'closed', branch: 'Medan' }
      ] as Lead[]
    }
  },
  computed: {
    filteredLeads(): Lead[] {
      if (this.selectedBranch === 'all') return this.leads

      return this.leads.filter((lead: Lead) =>
        (lead.branch || '').toLowerCase() === this.selectedBranch.toLowerCase()
      )
    }
  },
  mounted() {
    this.fetchLeads()
  },
  methods: {
    async fetchLeads() {
      const leadsUrl = getLeadsApiUrl()

      if (!leadsUrl) {
        console.log('VITE_LEADS_API_URL not configured')
        return
      }

      try {
        const response = await axiosHelper.get(leadsUrl)
        this.leads = response.data.map((lead: Lead) => ({
          ...lead,
          status: lead.status || 'new',
          branch: lead.branch || 'Jakarta'
        }))
        this.$emit('leadsUpdated', response.data)
      } catch (error: any) {
        console.error('Error fetching leads:', error)

        // Handle CORS and other network errors
        if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
          console.warn('Network error: Unable to connect to leads API. Using mock data.')
          // Keep existing mock data for development
        } else if (error.response) {
          console.error(`API error: ${error.response.status} - ${error.response.statusText}`)
        }
      }
    },
    getScoreColor(score: number) {
      if (score >= 80) return 'bg-emerald-100 text-emerald-700'
      if (score >= 60) return 'bg-amber-100 text-amber-700'
      return 'bg-rose-100 text-rose-700'
    },
    getLeadsByStatus(status: LeadStatus) {
      return this.filteredLeads.filter((lead: Lead) =>
        (lead.status || 'new').toLowerCase() === status
      )
    },
    getStatusClasses(color: string) {
      const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700'
      }

      return colors[color]
    }
  }
})
</script>

<template>
  <div class="space-y-6">

    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Leads</h2>
        <p class="text-sm text-gray-500">Track leads by progress and branch.</p>
      </div>
      <div class="flex gap-2">
        <div class="!relative">
          <!-- <MapPin :size="15" class="pointer-events-none absolute left-3 -translate-y-1/2 text-gray-400" /> -->
          <select v-model="selectedBranch"
            class="w-full appearance-none px-3 py-3 pr-10 bg-white border border-black text-black rounded-md">
            <option value="all">All branches</option>
            <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
          </select>
          <ChevronDown :size="18" class="pointer-events-none !absolute right-3 top-1/2 -translate-y-1/2 text-black" />
        </div>

        <button @click="fetchLeads" class="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2">
          <RefreshCw :size="14" />
          Refresh
        </button>

      </div>
    </div>




    <div class="grid gap-4 lg:grid-cols-3">
      <section v-for="status in statuses" :key="status.key"
        class="min-w-0 rounded-3xl border border-gray-100 bg-white p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              :class="getStatusClasses(status.color)">
              <component :is="status.icon" :size="17" />
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-gray-900">{{ status.label }}</h4>
              <p class="truncate text-xs text-gray-500">{{ status.description }}</p>
            </div>
          </div>
          <span
            class="flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-gray-700 shadow-sm">
            {{ getLeadsByStatus(status.key).length }}
          </span>
        </div>

        <div class="space-y-3 h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          <article v-for="lead in getLeadsByStatus(status.key)" :key="lead.id"
            class="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
            <div class="mb-3 flex justify-between gap-3">
              <div class="flex">
                <div
                  class="flex h-10 w-10 me-3 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                  {{ lead.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-sm text-gray-900">{{ lead.name }}</p>
                  <p class="text-xs text-gray-500">{{ lead.phone }}</p>
                </div>
              </div>
              <span class="text-[10px] ">
                <span v-if="moment(lead.updatedAt).isSame(moment(), 'D')">{{
                  moment(lead.updatedAt).format('HH.mm') }}</span>
                <span v-else-if="moment().diff(moment(lead.updatedAt), 'days') == 1">Yesterday</span>
                <span v-else-if="moment().diff(moment(lead.updatedAt), 'days') >= 1">{{
                  moment(lead.updatedAt).format('dddd') }}</span>
                <span v-else>{{ moment(lead.updatedAt).fromNow() }}</span>
              </span>
            </div>

            <div class="flex items-center gap-1.5 mb-3 text-xs capitalize text-gray-500">
              {{ lead.message }}
            </div>
            <div class="flex justify-between  gap-2 border-t border-gray-100 pt-3">
              <div class="flex items-center gap-1.5 text-xs capitalize text-gray-500">
                <MapPin :size="13" />
                {{ lead.branch }}
              </div>
              <div class="flex items-center gap-1.5 text-xs capitalize text-gray-500">
                <MessageCircleMore v-if="lead.source === 'whatsapp'" :size="13" />
                <Globe v-else :size="13" />
                {{ lead.source }}
              </div>

            </div>
          </article>

          <div v-if="getLeadsByStatus(status.key).length === 0"
            class="flex min-h-32 flex-col items-center justify-center rounded-md bg-white/60 p-5 mt-5 text-center">
            <Users :size="22" class="mb-2 text-gray-300" />
            <p class="text-sm font-medium text-gray-500">No leads found</p>
            <p class="text-xs text-gray-400">Try another branch filter.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
