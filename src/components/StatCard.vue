<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <div class="p-6">
      <div class="flex justify-between items-start">
        <div :class="['p-3 rounded-3xl bg-gray-50', iconColor]">
          <component :is="icon" size="20" />
        </div>
        <span v-if="change" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {{ change }}
        </span>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
        <h3 class="mt-1 text-3xl font-bold text-gray-900">{{ value }}</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'

export default defineComponent({
  name: 'StatCard',
  props: {
    title: String,
    value: String,
    change: String,
    icon: Object as () => Component,
    iconColor: {
      type: String,
      default: 'text-gray-500'
    }
  }
})
</script>
