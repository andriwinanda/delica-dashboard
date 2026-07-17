<script setup lang="ts">
import SimpleManagementTab from './SimpleManagementTab.vue'
</script>

<template>
    <SimpleManagementTab resource="customers" title="Customers" :fields="['name', 'phone', 'email', 'address']" />
</template>
