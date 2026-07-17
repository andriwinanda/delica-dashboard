<script lang="ts">
import { defineComponent } from 'vue'
import { Eye, RefreshCw } from 'lucide-vue-next'
import { managementService } from '@/services/managementService'
import { getApiErrorMessage } from '@/utils/axiosHelper'
import type { Branch, Location } from '@/types/api'

export default defineComponent({
  name: 'LocationTab',
  components: { Eye, RefreshCw },
  data: () => ({ locations: [] as Location[], selectedLocation: null as Location | null, dialogOpen: false, loading: false, detailLoading: false, error: '' }),
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true; this.error = ''
      try { this.locations = await managementService.listLocations() }
      catch (error) { this.error = getApiErrorMessage(error, 'Gagal memuat locations.') }
      finally { this.loading = false }
    },
    async showDetail(item: Location) {
      this.dialogOpen = true; this.detailLoading = true; this.error = ''
      try { this.selectedLocation = await managementService.getLocation(item.idLocation) }
      catch (error) { this.selectedLocation = item; this.error = getApiErrorMessage(error, 'Gagal memuat detail location.') }
      finally { this.detailLoading = false }
    },
    branchKey(branch: Branch, index: number) { return branch._id || branch.id || `${branch.code}-${index}` }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold">Locations</h2>
      <p class="text-sm text-gray-500">Kelola data locations.</p>
    </div>
    <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <dialog v-if="dialogOpen" open
        class="!fixed !inset-0 !z-50 !m-0 flex !h-screen !w-screen !max-h-none !max-w-none items-center justify-center bg-black/40 p-4"
        @click.self="dialogOpen = false" @keydown.esc="dialogOpen = false">
        <div class="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold capitalize">{{ selectedLocation?.location || 'Location detail' }}</h3>
              <p class="text-sm text-gray-500">{{ selectedLocation?.description || 'No description' }}</p>
            </div><button type="button" class="text-2xl text-gray-400 hover:text-gray-900" aria-label="Tutup"
              @click="dialogOpen = false">&times;</button>
          </div>
          <p v-if="detailLoading" class="py-8 text-center text-sm text-gray-400">Memuat branches...</p>
          <div v-else-if="selectedLocation?.branches?.length" class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead>
                <tr class="border-b text-xs uppercase text-gray-500">
                  <th class="px-3 py-3">Name</th>
                  <th class="px-3 py-3">Code</th>
                  <th class="px-3 py-3">City</th>
                  <th class="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(branch, index) in selectedLocation.branches" :key="branchKey(branch, index)"
                  class="border-b border-gray-100">
                  <td class="px-3 py-3">{{ branch.name }}</td>
                  <td class="px-3 py-3">{{ branch.code }}</td>
                  <td class="px-3 py-3 capitalize">{{ branch.city || '-' }}</td>
                  <td class="px-3 py-3"><span :class="branch.isActive ? 'text-green-600' : 'text-gray-400'">{{
                    branch.isActive ? 'Active' : 'Inactive' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="py-8 text-center text-sm text-gray-400">No branches assigned to this location.</p>
        </div>
      </dialog>
      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>
      <div class="mb-4 flex justify-end"><button class="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md" @click="load">
          <RefreshCw :size="14" />Refresh
        </button></div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase text-gray-500">
              <th class="px-3 py-3">Location</th>
              <th class="px-3 py-3">Description</th>
              <th class="px-3 py-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in locations" :key="item.idLocation" class="border-b border-gray-100">
              <td class="px-3 py-3 capitalize">{{ item.location }}</td>
              <td class="px-3 py-3">{{ item.description || '-' }}</td>
              <td class="px-3 py-3"><button title="View branches" @click="showDetail(item)">
                  <Eye :size="15" />
                </button></td>
            </tr>
            <tr v-if="!locations.length">
              <td colspan="3" class="py-10 text-center text-gray-400">{{ loading ? 'Memuat...' : 'Belum ada data.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
