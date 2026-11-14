<script setup lang="ts">
import InterestManagement from '~/features/capstone/components/InterestManagement.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['ADMIN', 'KOORDINATOR_TA'] })
useHead({ title: 'Bidang minat · Capstone' })
</script>
<template><InterestManagement /></template>
