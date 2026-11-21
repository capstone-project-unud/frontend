<script setup lang="ts">
import InterestManagement from '~/features/capstone/components/InterestManagement.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['ADMIN', 'KOORDINATOR_TA'], workspaceTitle: 'Bidang minat', workspaceDescription: 'Kelola pilihan bidang minat untuk pendaftaran judul.' })
useHead({ title: 'Bidang minat · Capstone' })
</script>
<template><InterestManagement /></template>
