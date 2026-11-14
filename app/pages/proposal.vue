<script setup lang="ts">
import ProposalView from '~/features/capstone/components/ProposalView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA', 'TU', 'KOORDINATOR_TA', 'ADMIN'] })
useHead({ title: 'Persyaratan UP · Capstone' })
</script>
<template><ProposalView /></template>
