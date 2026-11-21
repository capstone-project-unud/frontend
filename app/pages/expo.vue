<script setup lang="ts">
import ExpoView from '~/features/capstone/components/ExpoView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
  workspaceTitle: 'Capstone Expo',
  workspaceDescription: 'Pengajuan karya pameran (Poster X-Banner 60x160 cm, Video, GitHub) dan Galeri Publik karya mahasiswa.',
})
useHead({ title: 'Capstone Expo · Capstone' })
</script>
<template><ExpoView /></template>
