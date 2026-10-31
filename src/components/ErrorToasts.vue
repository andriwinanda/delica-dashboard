<script setup lang="ts">
import { errorToasts, dismissToast } from '@/utils/toast'
</script>

<template>
  <Teleport to="body">
    <div class="error-toast-container flex flex-col gap-3" aria-label="Error notifications">
      <div v-for="toast in errorToasts" :key="toast.id" role="alert"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-red-700 shadow-lg">
        <span class="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{{ toast.message }}</span>
        <button type="button" @click="dismissToast(toast.id)" aria-label="Dismiss notification"
          class="shrink-0 rounded px-1 text-xl leading-none hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500">&times;</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.error-toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  width: calc(100% - 2rem);
  max-width: 24rem;
  pointer-events: none;
}

.error-toast-container > * {
  pointer-events: auto;
}
</style>
