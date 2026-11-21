<script setup lang="ts">
import ProjectList from '~/features/capstone/components/ProjectList.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'], workspaceTitle: 'Daftar judul capstone', workspaceDescription: 'Pantau pendaftaran dan unduh data sesuai bidang minat.' })
useHead({ title: 'Judul capstone · Capstone' })
</script>
<template><ProjectList /></template>
