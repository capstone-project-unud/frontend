<script setup lang="ts">
import GroupsView from '~/features/capstone/components/GroupsView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth', 'roles'],
  roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'ADMIN'],
  workspaceTitle: 'Kelompok capstone',
  workspaceDescription: 'Bentuk kelompok 2–5 mahasiswa, tetapkan Ketua Kelompok, tanggung jawab, dan pembimbing.',
})
useHead({ title: 'Kelompok Capstone · Capstone' })
</script>
<template><GroupsView /></template>
