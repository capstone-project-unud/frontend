<script setup lang="ts">
import ProfileView from '~/features/profile/components/ProfileView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'], workspaceTitle: 'Profil saya', workspaceDescription: 'Kelola informasi pribadi dan kata sandi akun Anda.' })
useHead({ title: 'Profil saya · Capstone' })
</script>
<template><ProfileView /></template>
