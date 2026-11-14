<script setup lang="ts">
import ProjectForm from '~/features/capstone/components/ProjectForm.vue'
definePageMeta({ layout: 'workspace', middleware: ['auth', 'roles'], roles: ['MAHASISWA'] })
useHead({ title: 'Pendaftaran judul · Capstone' })
</script>
<template><section><header class="page-heading"><div><h1>Pendaftaran judul capstone</h1><p>Siapkan deskripsi dengan pengesahan dan data seluruh anggota kelompok.</p></div></header><ProjectForm @saved="project => navigateTo('/capstone/' + project.id)" @cancel="navigateTo('/capstone')" /></section></template>
