<script setup lang="ts">
import UserManagement from '~/features/users/components/UserManagement.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'admin'] })
useHead({ title: 'Manajemen pengguna · Capstone' })
</script>
<template><UserManagement /></template>
