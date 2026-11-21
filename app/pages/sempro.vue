<script setup lang="ts">
import ProposalExamView from '~/features/capstone/components/ProposalExamView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN', 'KOPRODI'], workspaceTitle: 'Ujian proposal', workspaceDescription: 'Kelola informasi ujian, pantau nilai, dan cetak dokumen ujian.' })
useHead({ title: 'Ujian proposal · Capstone' })
</script>
<template><ProposalExamView /></template>
