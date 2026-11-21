<script setup lang="ts">
import MasterDataView from '~/features/capstone/components/MasterDataView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth', 'roles'],
  roles: ['ADMIN', 'KOORDINATOR_TA'],
  workspaceTitle: 'Data master akademik',
  workspaceDescription: 'Kelola periode akademik, bidang minat, katalog jenis dokumen, persyaratan tahap, dan rubrik CPMK.',
})
useHead({ title: 'Data Master · Capstone' })
</script>
<template><MasterDataView /></template>
