<template>
  <button
    @click="$emit('click')"
    type="button"
    :class="[
      'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
      active
        ? 'bg-black text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-black',
      !isOpen && 'justify-center px-0'
    ]"
  >
    <component :is="icon" size="20" />
    <span v-if="isOpen" class="font-medium text-sm">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'

export default defineComponent({
  name: 'SidebarItem',
  props: {
    icon: Object as () => Component,
    label: String,
    active: Boolean,
    isOpen: Boolean
  },
  emits: ['click']
})
</script>
