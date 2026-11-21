<script setup lang="ts">
import ProjectForm from '~/features/capstone/components/ProjectForm.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA'], workspaceTitle: 'Pendaftaran judul capstone', workspaceDescription: 'Siapkan deskripsi dengan pengesahan dan data seluruh anggota kelompok.' })
useHead({ title: 'Pendaftaran judul · Capstone' })
</script>
<template><section><ProjectForm @saved="project => navigateTo('/capstone/' + project.id)" @cancel="navigateTo('/capstone')" /></section></template>
