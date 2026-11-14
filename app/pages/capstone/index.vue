<script setup lang="ts">
import ProjectList from '~/features/capstone/components/ProjectList.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'] })
useHead({ title: 'Judul capstone · Capstone' })
</script>
<template><ProjectList /></template>
