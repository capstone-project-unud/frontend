<script setup lang="ts">
import FinalExamView from '~/features/capstone/components/FinalExamView.vue'
definePageMeta({
  layout: 'workspace',
  middleware: ['auth', 'roles'],
  roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN'],
  workspaceTitle: 'Ujian akhir capstone',
  workspaceDescription: 'Verifikasi 11 syarat pendaftaran, penjadwalan, penilaian rubrik Proyek Akhir II, dan penyelesaian revisi.',
})
useHead({ title: 'Ujian Akhir · Capstone' })
</script>
<template><FinalExamView /></template>
