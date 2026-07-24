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

interface PeriodMonth {
  value: number
  label: string
}

interface Lead {
  id: number | string
  _id?: number | string
  name: string
  phone: string
  score: number
  label: string
  status?: LeadStatus
  branch?: string
  message?: string
  source?: string
  updatedAt?: string
}

interface LeadsPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface StatusState extends LeadsPagination {
  loading: boolean
  hasMore: boolean
}

const createStatusState = (): StatusState => ({
  page: 0,
  limit: 20,
  total: 0,
  pages: 0,
  loading: false,
  hasMore: true
})

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
      selectedMonth: Number(moment().format('M')),
      selectedYear: Number(moment().format('YYYY')),
      months: moment.months().map((label, index) => ({
        value: index + 1,
        label
      })) as PeriodMonth[],
      years: Array.from({ length: 10 }, (_, index) => moment().year() - index),
      branches: ['Jakarta', 'Medan', 'Surabaya'],
      statuses: [
        { key: 'new', label: 'New', description: 'Leads that need follow-up', icon: Clock3, color: 'blue' },
        { key: 'contacted', label: 'Contacted', description: 'Leads already contacted', icon: MessageCircle, color: 'amber' },
        { key: 'closed', label: 'Closed', description: 'Completed leads', icon: CheckCircle2, color: 'emerald' }
      ],
      leads: [] as Lead[],
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().endOf('month').format('YYYY-MM-DD'),
      statusState: {
        new: createStatusState(),
        contacted: createStatusState(),
        closed: createStatusState()
      } as Record<LeadStatus, StatusState>,
      requestVersion: 0
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
    async fetchLeads(reset = true) {
      const activeRequestVersion = reset ? this.requestVersion + 1 : this.requestVersion

      if (reset) {
        this.requestVersion = activeRequestVersion
        this.leads = []
        ;(['new', 'contacted', 'closed'] as LeadStatus[]).forEach((status) => {
          this.statusState[status] = createStatusState()
        })
      }

      await Promise.all(
        (['new', 'contacted', 'closed'] as LeadStatus[]).map((status) =>
          this.fetchLeadsByStatus(status, activeRequestVersion)
        )
      )
    },
    async fetchLeadsByStatus(status: LeadStatus, requestVersion = this.requestVersion) {
      const leadsUrl = getLeadsApiUrl()
      const state = this.statusState[status]

      if (!leadsUrl || state.loading || !state.hasMore) return

      const requestedPage = state.page + 1
      state.loading = true

      try {
        const response = await axiosHelper.get(leadsUrl, {
          params: {
            status,
            page: requestedPage,
            limit: state.limit,
            startDate: this.startDate,
            endDate: this.endDate
          }
        })

        if (requestVersion !== this.requestVersion) return

        const root = response.data
        const payload = root?.results ?? root?.result ?? root?.data ?? root
        const rows: Lead[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload?.leads)
                ? payload.leads
                : []
        const pagination = payload?.pagination ?? payload?.meta ?? root?.pagination ?? root?.meta
        const incoming = rows.map((lead: Lead, index: number) => ({
          ...lead,
          id: lead.id ?? lead._id ?? `${status}-${lead.phone || index}`,
          // The endpoint is queried per status; keep the lane canonical even
          // when the backend omits or returns a different status value.
          status
        }))
        const incomingIds = new Set(incoming.map((lead) => `${status}:${String(lead.id)}`))

        this.leads = [
          ...this.leads.filter((lead) => !incomingIds.has(`${lead.status}:${String(lead.id)}`)),
          ...incoming
        ]
        state.page = Number(pagination?.page) || requestedPage
        state.limit = Number(pagination?.limit ?? pagination?.perPage ?? pagination?.per_page) || state.limit
        state.total = Number(pagination?.total ?? payload?.total) || incoming.length
        state.pages = Number(pagination?.pages ?? pagination?.totalPages ?? pagination?.last_page) || 0
        state.hasMore = state.pages > 0
          ? state.page < state.pages
          : incoming.length >= state.limit
        this.$emit('leadsUpdated', this.leads)
      } catch (error: any) {
        console.error('Error fetching leads:', error)
      } finally {
        if (requestVersion === this.requestVersion) state.loading = false
      }
    },
    applyPeriodFilter() {
      const selectedDate = moment({
        year: Number(this.selectedYear),
        month: Number(this.selectedMonth) - 1
      })

      this.startDate = selectedDate.clone().startOf('month').format('YYYY-MM-DD')
      this.endDate = selectedDate.clone().endOf('month').format('YYYY-MM-DD')
      this.fetchLeads()
    },
    handleStatusScroll(status: LeadStatus, event: Event) {
      const element = event.currentTarget as HTMLElement
      const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight

      if (distanceFromBottom <= 120) this.fetchLeadsByStatus(status)
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
    getStatusTotal(status: LeadStatus) {
      return this.selectedBranch === 'all'
        ? this.statusState[status].total
        : this.getLeadsByStatus(status).length
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
          <select v-model.number="selectedMonth" @change="applyPeriodFilter"
            class="w-full appearance-none px-3 py-3 pr-10 bg-white border border-black text-black rounded-md">
            <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
          </select>
          <ChevronDown :size="18" class="pointer-events-none !absolute right-3 top-1/2 -translate-y-1/2 text-black" />
        </div>

        <div class="!relative">
          <select v-model.number="selectedYear" @change="applyPeriodFilter"
            class="w-full appearance-none px-3 py-3 pr-10 bg-white border border-black text-black rounded-md">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
          <ChevronDown :size="18" class="pointer-events-none !absolute right-3 top-1/2 -translate-y-1/2 text-black" />
        </div>

        <div class="!relative">
          <!-- <MapPin :size="15" class="pointer-events-none absolute left-3 -translate-y-1/2 text-gray-400" /> -->
          <select v-model="selectedBranch"
            class="w-full appearance-none px-3 py-3 pr-10 bg-white border border-black text-black rounded-md">
            <option value="all">All branches</option>
            <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
          </select>
          <ChevronDown :size="18" class="pointer-events-none !absolute right-3 top-1/2 -translate-y-1/2 text-black" />
        </div>

        <button @click="fetchLeads()" class="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2">
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
            {{ getStatusTotal(status.key) }}
          </span>
        </div>

        <div class="space-y-3 h-[500px] overflow-y-auto pr-2 scrollbar-thin"
          @scroll.passive="handleStatusScroll(status.key, $event)">
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

          <div v-if="statusState[status.key].loading"
            class="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
            <RefreshCw :size="14" class="animate-spin" />
            Loading leads...
          </div>

          <div v-else-if="getLeadsByStatus(status.key).length === 0"
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
