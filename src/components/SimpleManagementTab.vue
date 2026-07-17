<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/utils/axiosHelper'
import { managementService, type ManagementRecord } from '@/services/managementService'

type Resource = 'customers' | 'quotations'

export default defineComponent({
  name: 'SimpleManagementTab',
  components: { Plus, RefreshCw, Pencil, Trash2 },
  props: {
    resource: { type: String as PropType<Resource>, required: true },
    title: { type: String, required: true },
    fields: { type: Array as PropType<string[]>, required: true }
  },
  data: () => ({ items: [] as ManagementRecord[], form: {} as ManagementRecord, editingId: null as string | number | null, dialogOpen: false, loading: false, error: '' }),
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true; this.error = ''
      try { this.items = this.resource === 'customers' ? await managementService.listCustomers() : await managementService.listQuotations() }
      catch (error) { this.error = getApiErrorMessage(error, `Gagal memuat ${this.title.toLowerCase()}.`) }
      finally { this.loading = false }
    },
    reset() { this.form = {}; this.editingId = null; this.dialogOpen = false },
    openCreate() { this.reset(); this.dialogOpen = true },
    edit(item: ManagementRecord) { this.editingId = item._id || item.id; this.form = { ...item }; this.dialogOpen = true },
    async save() {
      this.loading = true; this.error = ''
      try {
        if (this.editingId === null) {
          await (this.resource === 'customers' ? managementService.createCustomer(this.form) : managementService.createQuotation(this.form))
        } else {
          await (this.resource === 'customers' ? managementService.updateCustomer(this.editingId, this.form) : managementService.updateQuotation(this.editingId, this.form))
        }
        this.reset(); await this.load()
      } catch (error) { this.error = getApiErrorMessage(error, 'Gagal menyimpan data.') }
      finally { this.loading = false }
    },
    async remove(id: string | number) {
      if (!window.confirm('Hapus data ini?')) return
      try {
        await (this.resource === 'customers' ? managementService.deleteCustomer(id) : managementService.deleteQuotation(id)); await this.load()
      } catch (error) { this.error = getApiErrorMessage(error, 'Gagal menghapus data.') }
    },
    display(item: ManagementRecord, field: string) {
      return item[field] ?? item[field.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`)] ?? '-'
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ title }}</h2>
        <p class="text-sm text-gray-500">Kelola data {{ title.toLowerCase() }}.</p>
      </div><button class="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2" @click="openCreate">
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
              <h3 class="text-xl font-semibold">{{ editingId === null ? 'Tambah' : 'Edit' }} {{ title }}</h3>
              <p class="text-sm text-gray-500">Lengkapi data berikut.</p>
            </div><button type="button" class="text-2xl text-gray-400 hover:text-gray-900" aria-label="Tutup"
              @click="reset">&times;</button>
          </div>
          <div class="grid gap-3 md:grid-cols-2"><input v-for="field in fields" :key="field" v-model="form[field]"
              type="text" :placeholder="field" class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div class="mt-6 flex justify-end gap-2"><button type="button" class="rounded-xl border px-4 py-2 text-sm"
              @click="reset">Batal</button><button
              class="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="loading">{{ editingId === null ? 'Simpan' : 'Update' }}</button></div>
        </form>
      </dialog>
      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>
      <div class="mb-4 flex justify-end"><button class="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md" @click="load">
          <RefreshCw :size="14" />Refresh
        </button></div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase text-gray-500">
              <th v-for="field in fields" :key="field" class="px-3 py-3">{{ field }}</th>
              <th class="px-3 py-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id || item.id" class="border-b border-gray-100">
              <td v-for="field in fields" :key="field" class="px-3 py-3">{{ display(item, field) }}</td>
              <td class="flex gap-2 px-3 py-3"><button @click="edit(item)">
                  <Pencil :size="15" />
                </button><button @click="remove(item._id || item.id)">
                  <Trash2 :size="15" class="text-red-500" />
                </button></td>
            </tr>
            <tr v-if="!items.length">
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
