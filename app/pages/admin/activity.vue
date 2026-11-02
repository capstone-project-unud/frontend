<script setup lang="ts">
import ActivityView from '~/features/activity/components/ActivityView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'admin'] })
useHead({ title: 'Aktivitas pengguna · Capstone' })
</script>
<template><ActivityView /></template>
