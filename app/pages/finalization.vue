<script setup lang="ts">
import FinalizationView from '~/features/capstone/components/FinalizationView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['KOORDINATOR_TA'], workspaceTitle: 'Finalisasi judul', workspaceDescription: 'Tetapkan pembimbing per mahasiswa dan catat dua keputusan rapat secara terpisah.' })
useHead({ title: 'Finalisasi judul · Capstone' })
</script>
<template><FinalizationView /></template>
