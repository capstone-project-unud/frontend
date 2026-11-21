<script setup lang="ts">
import DashboardView from '~/features/dashboard/components/DashboardView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'], workspaceTitle: 'Dashboard', workspaceDescription: 'Pantau aktivitas capstone sesuai peran Anda.' })
useHead({ title: 'Dashboard · Capstone' })
</script>
<template><DashboardView /></template>
