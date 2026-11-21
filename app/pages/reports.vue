<script setup lang="ts">
import ReportsView from '~/features/capstone/components/ReportsView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth', 'roles'],
  roles: ['ADMIN', 'KOORDINATOR_TA', 'TU', 'KOPRODI'],
  workspaceTitle: 'Monitoring dan pelaporan',
  workspaceDescription: 'Rekapitulasi kemajuan proyek, aktivitas bimbingan, serta hasil ujian & publikasi Expo.',
})
useHead({ title: 'Monitoring & Pelaporan · Capstone' })
</script>
<template><ReportsView /></template>
