<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard'
import DashboardMetrics from './DashboardMetrics.vue'
import DashboardTasks from './DashboardTasks.vue'
import DashboardProjects from './DashboardProjects.vue'
const dashboard = useDashboard()
const { data, status, error, refresh } = dashboard.summary
const { data: users, error: usersError, refresh: refreshUsers } = dashboard.users
const { admin, definition, metrics, userMetrics, tasks } = dashboard
const personal = computed(() => data.value?.scope === 'student' || data.value?.scope === 'lecturer')
const primary = computed(() => {
 if (data.value?.scope === 'student' && !data.value.stats.projects) return { to: '/capstone/new', label: 'Daftarkan judul' }
 if (data.value?.scope === 'coordinator') return { to: '/finalization', label: 'Buka finalisasi' }
 if (data.value?.scope === 'tu') return { to: '/proposal', label: 'Periksa berkas UP' }
 return { to: '/capstone', label: 'Buka daftar judul' }
})
</script>
<template>
 <section><header class="page-heading"><div><h1>{{ definition?.title || 'Dashboard' }}</h1><p v-if="definition">{{ definition.description }}</p></div></header>
 <p v-if="status === 'pending'" role="status" class="cap-loading">Memuat ringkasan…</p>
 <div v-else-if="error" class="notice error" role="alert">Ringkasan belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button></div>
 <div v-else-if="data" class="dashboard-stack"><section class="panel workspace-statistics-panel" aria-label="Ringkasan capstone"><DashboardMetrics :items="metrics" label="Ringkasan sesuai peran" /></section>
 <section v-if="admin" class="panel dashboard-accounts" aria-labelledby="dashboard-accounts"><div class="workspace-panel-header"><h2 id="dashboard-accounts">Akun pengguna</h2><NuxtLink class="cap-link" to="/admin/users">Manajemen pengguna</NuxtLink></div><div v-if="usersError" class="notice error" role="alert">Statistik akun belum dapat dimuat. <button class="button secondary" @click="refreshUsers()">Coba lagi</button></div><div v-else-if="users" class="dashboard-account-metrics"><DashboardMetrics :items="userMetrics" label="Statistik akun" /></div><p v-else role="status">Memuat statistik akun…</p></section>
 <div class="dashboard-content"><DashboardTasks :items="tasks" :primary="primary" /><DashboardProjects :projects="data.recent_projects" :personal="personal" /></div>
 <section v-if="data.interest_summary.length" class="panel workspace-panel cap-list-panel" aria-labelledby="dashboard-interests"><div class="workspace-panel-header"><div class="workspace-panel-title"><h2 id="dashboard-interests">Pendaftaran menurut bidang minat</h2></div></div><div class="workspace-table cap-table-wrap" tabindex="0" aria-label="Rekap pendaftaran menurut bidang minat"><table class="workspace-table cap-table"><caption class="visually-hidden">Jumlah judul per bidang minat</caption><thead><tr><th scope="col">Bidang minat</th><th scope="col">Judul terdaftar</th><th scope="col">Sudah ditetapkan</th></tr></thead><tbody><tr v-for="interest in data.interest_summary" :key="interest.name"><th scope="row">{{ interest.name }}</th><td>{{ interest.total }}</td><td>{{ interest.finalized }}</td></tr></tbody></table></div></section>
 </div></section>
</template>
<style scoped>.dashboard-stack { display: grid; gap: 2rem; }.dashboard-stack .workspace-statistics-panel { margin-bottom: 0; }.dashboard-accounts { min-width: 0; }.dashboard-accounts h2 { font-size: 1.125rem; font-weight: 600; }.dashboard-account-metrics { padding: .75rem 2rem 1.75rem; }@media(max-width:767px) { .dashboard-stack { gap: 1.5rem; }.dashboard-account-metrics { padding: .75rem 1.25rem 1.25rem; } }.dashboard-content { display: grid; grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 1.5rem; align-items: start; }@media(max-width:1199px) { .dashboard-content { grid-template-columns: minmax(0,1fr); } }</style>
