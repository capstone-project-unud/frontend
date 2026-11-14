<script setup lang="ts">
import DashboardView from '~/features/dashboard/components/DashboardView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'] })
useHead({ title: 'Dashboard · Capstone' })
</script>
<template><DashboardView /></template>
