<script setup lang="ts">
import FinalizationView from '~/features/capstone/components/FinalizationView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['KOORDINATOR_TA'] })
useHead({ title: 'Finalisasi judul · Capstone' })
</script>
<template><FinalizationView /></template>
