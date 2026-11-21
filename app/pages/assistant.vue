<script setup lang="ts">
import AssistantView from '~/features/capstone/components/AssistantView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
  workspaceTitle: 'Asisten pedoman Capstone',
  workspaceDescription: 'Temukan informasi tentang pendaftaran, bimbingan, ujian, dan Expo.',
})
useHead({ title: 'Asisten Pedoman · Capstone' })
</script>
<template><AssistantView /></template>
