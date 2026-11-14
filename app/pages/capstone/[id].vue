<script setup lang="ts">
import ProjectDetail from '~/features/capstone/components/ProjectDetail.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'] })
useHead({ title: 'Detail judul · Capstone' })
const route = useRoute()
</script>
<template><ProjectDetail :key="String(route.params.id)" :id="String(route.params.id)" /></template>
