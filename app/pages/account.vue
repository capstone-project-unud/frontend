<script setup lang="ts">
import ProfileView from '~/features/profile/components/ProfileView.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth'] })
useHead({ title: 'Profil saya · Capstone' })
</script>
<template><ProfileView /></template>
