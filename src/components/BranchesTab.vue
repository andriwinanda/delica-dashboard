<script lang="ts">
import { defineComponent } from 'vue'
import { Plus, RefreshCw, Pencil } from 'lucide-vue-next'
import { managementService } from '@/services/managementService'
import { getApiErrorMessage } from '@/utils/axiosHelper'
import type { Branch, BranchPayload, Location } from '@/types/api'

const formFields = ['code', 'name', 'city', 'location', 'address', 'phone', 'targetRevenue', 'isActive']
const tableFields = ['code', 'location', 'address', 'phone', 'targetRevenue']
const emptyForm = (): BranchPayload => ({ code: '', name: '', city: '', address: '', phone: '', location: '', targetRevenue: 0, isActive: true })

export default defineComponent({
  name: 'BranchesTab',
  components: { Plus, RefreshCw, Pencil },
  data: () => ({ branches: [] as Branch[], locations: [] as Location[], fields: tableFields, formFields, form: emptyForm(), editingId: null as string | number | null, dialogOpen: false, loading: false, error: '' }),
  mounted() { this.loadLocations(); this.load() },
  methods: {
    async load() {
      this.loading = true; this.error = ''
      try { this.branches = await managementService.listBranches() }
      catch (error) { this.error = getApiErrorMessage(error, 'Gagal memuat branches.') }
      finally { this.loading = false }
    },
    async loadLocations() {
      try { this.locations = await managementService.listLocations() }
      catch (error) { this.error = getApiErrorMessage(error, 'Gagal memuat locations.') }
    },
    reset() { this.form = emptyForm(); this.editingId = null; this.dialogOpen = false },
    openCreate() { this.reset(); this.dialogOpen = true },
    locationId(location: Branch['location']): string {
      if (!location) return ''
      return typeof location === 'string' ? location : location._id || location.idLocation || ''
    },
    async edit(item: Branch) {
      const id = item._id || item.id
      if (!id) return
      this.editingId = id; this.loading = true; this.error = ''
      try {
        const branch = await managementService.getBranch(id)
        this.form = { code: branch.code || '', name: branch.name || '', city: branch.city || '', address: branch.address || '', phone: branch.phone || '', location: this.locationId(branch.location), targetRevenue: branch.targetRevenue ?? 0, isActive: branch.isActive ?? true }
        this.dialogOpen = true
      } catch (error) { this.editingId = null; this.error = getApiErrorMessage(error, 'Gagal memuat detail branch.') }
      finally { this.loading = false }
    },
    payload(): BranchPayload {
      return { code: String(this.form.code || ''), name: String(this.form.name || ''), city: String(this.form.city || ''), address: String(this.form.address || ''), phone: String(this.form.phone || ''), location: String(this.form.location || ''), targetRevenue: Number(this.form.targetRevenue) || 0, isActive: Boolean(this.form.isActive) }
    },
    async save() {
      this.loading = true; this.error = ''
      try {
        if (this.editingId === null) await managementService.createBranch(this.payload())
        else await managementService.updateBranch(this.editingId, this.payload())
        this.reset(); await this.load()
      } catch (error) { this.error = getApiErrorMessage(error, 'Gagal menyimpan data.') }
      finally { this.loading = false }
    },
    display(branch: Branch, field: string) {
      if (field === 'location') return typeof branch.location === 'object' && branch.location?.location ? branch.location.location : 'No location'
      const value = branch[field as keyof Branch]
      if (field === 'targetRevenue' && typeof value === 'number') return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
      if (field === 'isActive') return value ? 'Active' : 'Inactive'
      return value ?? '-'
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Branches</h2>
        <p class="text-sm text-gray-500">Kelola data branches.</p>
      </div>
      <button class="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2" @click="openCreate">
        <Plus :size="16" />Tambah
      </button>
    </div>
    <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <dialog v-if="dialogOpen" open
        class="!fixed !inset-0 !z-50 !m-0 flex !h-screen !w-screen !max-h-none !max-w-none items-center justify-center bg-black/40 p-4"
        @click.self="reset" @keydown.esc="reset">
        <form class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl" @submit.prevent="save">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold">{{ editingId === null ? 'Tambah' : 'Edit' }} Branches</h3>
              <p class="text-sm text-gray-500">Lengkapi data berikut.</p>
            </div>
            <button type="button" class="text-2xl text-gray-400 hover:text-gray-900" aria-label="Tutup"
              @click="reset">&times;</button>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <template v-for="field in formFields" :key="field">
              <label v-if="field === 'isActive'"
                class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                <input v-model="form.isActive" type="checkbox" />
                Active</label>
              <select v-else-if="field === 'location'" v-model="form.location"
                class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" required>
                <option value="" disabled>Select location</option>
                <option v-for="item in locations" :key="item.idLocation" :value="item.idLocation">
                  {{ item.location }}
                </option>
              </select>
              <input v-else v-model="form[field as keyof BranchPayload]"
                :type="field === 'targetRevenue' ? 'number' : 'text'" :placeholder="field"
                class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                :required="field === 'code' || field === 'name'" />
            </template>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="rounded-xl border px-4 py-2 text-sm" @click="reset">Batal</button>
            <button class="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="loading">{{ editingId === null ? 'Simpan' : 'Update' }}</button>
          </div>
        </form>
      </dialog>
      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>
      <div class="mb-4 flex justify-end">
        <button class="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md" @click="load">
          <RefreshCw :size="14" />Refresh
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase text-gray-500">
              <th v-for="field in fields" :key="field"
                :class="['px-3 py-3', field === 'phone' ? 'w-[160px] min-w-[160px]' : '']">{{ field }}</th>
              <th class="px-3 py-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in branches" :key="branch._id || branch.id" class="border-b border-gray-100">
              <td v-for="field in fields" :key="field"
                :class="['px-3 py-3', field === 'phone' ? 'w-[160px] min-w-[160px]' : '']">{{ display(branch, field) }}
              </td>
              <td class="px-3 py-3">
                <button title="Edit branch" @click="edit(branch)">
                  <Pencil :size="15" />
                </button>
              </td>
            </tr>
            <tr v-if="!branches.length">
              <td :colspan="fields.length + 1" class="py-10 text-center text-gray-400">
                {{ loading ? 'Memuat...' : 'Belum ada data.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
