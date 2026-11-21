<script setup lang="ts">
import ProjectDetail from '~/features/capstone/components/ProjectDetail.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'], workspaceTitle: 'Detail judul capstone', workspaceDescription: 'Tinjau deskripsi, anggota, dan keputusan untuk judul ini.' })
useHead({ title: 'Detail judul · Capstone' })
const route = useRoute()
</script>
<template><ProjectDetail :key="String(route.params.id)" :id="String(route.params.id)" /></template>
