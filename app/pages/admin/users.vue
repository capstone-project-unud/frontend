<script setup lang="ts">
import UserManagement from '~/features/users/components/UserManagement.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'admin'], workspaceTitle: 'Manajemen pengguna', workspaceDescription: 'Kelola akun, identitas akademik, dan akses pengguna.' })
useHead({ title: 'Manajemen pengguna · Capstone' })
</script>
<template><UserManagement /></template>
