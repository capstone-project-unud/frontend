<script setup lang="ts">
import GuidanceView from '~/features/capstone/components/GuidanceView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'ADMIN'], workspaceTitle: 'Log bimbingan', workspaceDescription: 'Catat pertemuan, tinjau hasil bimbingan, dan cetak log per mahasiswa.' })
useHead({ title: 'Log bimbingan · Capstone' })
</script>
<template><GuidanceView /></template>
