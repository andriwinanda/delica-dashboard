<script lang="ts">
import { defineComponent } from 'vue'
import axiosHelper, { getApiErrorMessage } from '@/utils/axiosHelper'
import StatCard from '@/components/StatCard.vue'
import {
  Building2,
  FileText,
  Package,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-vue-next'
import {
  getDashboardBranchesApiUrl,
  getDashboardKpiApiUrl,
  getDashboardProductsApiUrl
} from '@/utils/env'

type ApiRecord = Record<string, unknown>

interface BranchMetric {
  id: string | number
  name: string
  value: number
}

interface ProductMetric {
  id: string | number
  name: string
  quantity: number
  revenue: number
}

const unwrap = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload
  const record = payload as ApiRecord
  return record.data ?? record.result ?? payload
}

const asRecords = (payload: unknown): ApiRecord[] => {
  const value = unwrap(payload)
  if (Array.isArray(value)) return value as ApiRecord[]
  if (!value || typeof value !== 'object') return []

  const record = value as ApiRecord
  const collection = record.items ?? record.content ?? record.rows
  return Array.isArray(collection) ? collection as ApiRecord[] : []
}

const numberValue = (record: ApiRecord, keys: string[]) => {
  for (const key of keys) {
    const value = Number(record[key])
    if (Number.isFinite(value)) return value
  }
  return 0
}

const textValue = (record: ApiRecord, keys: string[], fallback: string) => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return fallback
}

export default defineComponent({
  name: 'OverviewTab',
  components: {
    StatCard,
    Building2,
    FileText,
    Package,
    RefreshCw,
    TrendingUp,
    Users
  },
  data() {
    return {
      isLoading: false,
      errorMessage: '',
      kpi: {} as ApiRecord,
      branchMetrics: [] as BranchMetric[],
      productMetrics: [] as ProductMetric[]
    }
  },
  computed: {
    kpiCards(): Array<{ title: string; value: string; icon: object; color: string }> {
      return [
        {
          title: 'Total Leads',
          value: this.formatNumber(numberValue(this.kpi, ['totalLeads', 'total_leads', 'leads'])),
          icon: Users,
          color: 'text-blue-500'
        },
        {
          title: 'Customers',
          value: this.formatNumber(numberValue(this.kpi, ['totalCustomers', 'total_customers', 'customers'])),
          icon: Building2,
          color: 'text-emerald-500'
        },
        {
          title: 'Quotations',
          value: this.formatNumber(numberValue(this.kpi, ['totalQuotations', 'total_quotations', 'quotations'])),
          icon: FileText,
          color: 'text-amber-500'
        },
        {
          title: 'Revenue',
          value: this.formatCurrency(numberValue(this.kpi, ['totalRevenue', 'total_revenue', 'revenue', 'sales'])),
          icon: TrendingUp,
          color: 'text-violet-500'
        }
      ]
    },
    maxBranchValue(): number {
      return Math.max(1, ...this.branchMetrics.map((branch) => branch.value))
    }
  },
  mounted() {
    this.fetchDashboard()
  },
  methods: {
    async fetchDashboard() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const [kpiResponse, branchesResponse, productsResponse] = await Promise.all([
          axiosHelper.get(getDashboardKpiApiUrl()),
          // axiosHelper.get(getDashboardBranchesApiUrl()),
          // axiosHelper.get(getDashboardProductsApiUrl())
        ])

        const kpi = unwrap(kpiResponse.data)
        this.kpi = kpi && typeof kpi === 'object' && !Array.isArray(kpi) ? kpi as ApiRecord : {}
        // this.branchMetrics = asRecords(branchesResponse.data).map((branch, index) => ({
        //   id: String(branch.id ?? branch.branchId ?? index),
        //   name: textValue(branch, ['name', 'branchName', 'branch_name'], `Branch ${index + 1}`),
        //   value: numberValue(branch, ['value', 'total', 'revenue', 'sales', 'count'])
        // }))
        // this.productMetrics = asRecords(productsResponse.data).map((product, index) => ({
        //   id: String(product.id ?? product.productId ?? index),
        //   name: textValue(product, ['name', 'productName', 'product_name'], `Product ${index + 1}`),
        //   quantity: numberValue(product, ['quantity', 'qty', 'total', 'sold']),
        //   revenue: numberValue(product, ['revenue', 'sales', 'amount', 'totalRevenue'])
        // }))
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, 'Unable to load dashboard data.')
      } finally {
        this.isLoading = false
      }
    },
    formatNumber(value: number) {
      return new Intl.NumberFormat('id-ID').format(value)
    },
    formatCurrency(value: number) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
    },
    branchWidth(value: number) {
      return `${Math.max(3, (value / this.maxBranchValue) * 100)}%`
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold">Overview</h2>
        <p class="text-sm text-gray-500">Live business performance from Delimitca API.</p>
        <p v-if="errorMessage" role="alert" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
      </div>
      <button :disabled="isLoading"
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
        @click="fetchDashboard">
        <RefreshCw :size="15" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard v-for="card in kpiCards" :key="card.title" :title="card.title" :value="card.value" :icon="card.icon"
        :icon-color="card.color" />
    </div>

    <div class="grid gap-6 xl:grid-cols-5">
      <section class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
        <div class="mb-6">
          <h3 class="text-lg font-semibold">Branch Performance</h3>
          <p class="text-sm text-gray-500">Performance totals across all branches.</p>
        </div>
        <div v-if="branchMetrics.length" class="space-y-5">
          <div v-for="branch in branchMetrics" :key="branch.id">
            <div class="mb-2 flex justify-between gap-4 text-sm">
              <span class="font-medium text-gray-700">{{ branch.name }}</span>
              <span class="text-gray-500">{{ formatNumber(branch.value) }}</span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div class="h-full rounded-full bg-gray-950 transition-all" :style="{ width: branchWidth(branch.value) }">
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex min-h-48 items-center justify-center text-sm text-gray-400">
          {{ isLoading ? 'Loading branches...' : 'No branch data available.' }}
        </div>
      </section>

      <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm xl:col-span-3">
        <div class="border-b border-gray-100 p-6">
          <h3 class="text-lg font-semibold">Top Products</h3>
          <p class="text-sm text-gray-500">Product sales and revenue performance.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-3 font-medium">Product</th>
                <th class="px-6 py-3 font-medium text-right">Quantity</th>
                <th class="px-6 py-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="product in productMetrics" :key="product.id" class="hover:bg-gray-50">
                <td class="px-6 py-4"><span class="flex items-center gap-3 text-sm font-medium"><span
                      class="rounded-xl bg-violet-50 p-2 text-violet-600">
                      <Package :size="16" />
                    </span>{{ product.name }}</span></td>
                <td class="px-6 py-4 text-right text-sm text-gray-600">{{ formatNumber(product.quantity) }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900">{{ formatCurrency(product.revenue)
                }}</td>
              </tr>
              <tr v-if="!productMetrics.length">
                <td colspan="3" class="px-6 py-16 text-center text-sm text-gray-400">{{ isLoading ? 'Loading  products...' : 'No product data available.' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
