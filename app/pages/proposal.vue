<script setup lang="ts">
import ProposalView from '~/features/capstone/components/ProposalView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA', 'DOSEN', 'TU', 'KOORDINATOR_TA', 'ADMIN', 'KOPRODI'], workspaceTitle: 'Pendaftaran proposal', workspaceDescription: 'Ajukan enam persyaratan, pantau validasi TU, dan unduh daftar pendaftaran.' })
useHead({ title: 'Pendaftaran proposal · Capstone' })
</script>
<template><ProposalView /></template>
