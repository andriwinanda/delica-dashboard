<script setup lang="ts">
import SimpleManagementTab from './SimpleManagementTab.vue'
</script>

<template>
    <SimpleManagementTab resource="quotations" title="Quotations"
        :fields="['customerId', 'amount', 'status', 'notes']" />
</template>
