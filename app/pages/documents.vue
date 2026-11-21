<script setup lang="ts">
import DocumentsView from '~/features/capstone/components/DocumentsView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth', 'roles'],
  roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN'],
  workspaceTitle: 'Dokumen capstone',
  workspaceDescription: 'Kelola unggahan & riwayat versi dokumen B-100 s.d. B-400, Proposal, Laporan Akhir, Pengesahan, dan Expo.',
})
useHead({ title: 'Dokumen Capstone · Capstone' })
</script>
<template><DocumentsView /></template>
