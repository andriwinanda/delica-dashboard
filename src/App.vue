<script lang="ts">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import ErrorToasts from '@/components/ErrorToasts.vue'

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
    ErrorToasts
  }
})
</script>

<template>
  <RouterView />
  <ErrorToasts />
</template>

<style>
@import '@/assets/base.css';
</style>
