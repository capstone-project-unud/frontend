<script setup lang="ts">
import { apiMessage, dateTime } from '~/utils/format'
interface Activity { id: number; actor: string; target: string; action: string; created_at: string }
const api = useRequestFetch()
const { data, status, error, refresh } = await useAsyncData('user-activity', () => api<{ items: Activity[] }>('/api/v1/users/audit'))
const labels: Record<string, string> = { USER_CREATED: 'membuat akun', USER_UPDATED: 'memperbarui akun', USER_ACTIVATED: 'mengaktifkan akun', USER_DEACTIVATED: 'menonaktifkan akun', PROFILE_UPDATED: 'memperbarui profil', PASSWORD_RESET: 'mengatur ulang kata sandi' }
</script>

<template>
  <section><div class="page-heading"><div><h1>Aktivitas pengguna</h1><p>20 perubahan akun dan profil terbaru yang tercatat di sistem.</p></div><button class="button secondary" :disabled="status === 'pending'" @click="refresh()">{{ status === 'pending' ? 'Memuat…' : 'Muat ulang' }}</button></div><div class="panel activity-panel"><p v-if="error" class="notice error" role="alert">{{ apiMessage(error) }}</p><div v-else-if="status === 'pending'" class="empty-state" role="status"><p>Memuat aktivitas…</p></div><ol v-else-if="data?.items.length" class="activity-list"><li v-for="item in data.items" :key="item.id"><span class="activity-dot" aria-hidden="true" /><div><p><strong>{{ item.actor }}</strong> {{ labels[item.action] || item.action }} <strong>{{ item.target }}</strong>.</p><time :datetime="item.created_at">{{ dateTime(item.created_at) }} WITA</time></div></li></ol><div v-else class="empty-state"><h3>Belum ada aktivitas</h3><p>Perubahan pengguna dan profil akan tercatat di sini.</p></div></div></section>
</template>

<style scoped>
.activity-panel { max-width: 950px; padding: .5rem 2rem; }
.activity-list { margin: 0; padding: 0; list-style: none; }
.activity-list li { display: flex; gap: 1rem; border-bottom: 1px solid var(--line); padding: 1.5rem 0; }
.activity-list li:last-child { border: 0; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; background: #8d7bac; margin-top: .4rem; flex-shrink: 0; }
.activity-list p { font-size: .875rem; line-height: 1.6; overflow-wrap: anywhere; }
.activity-list strong { font-weight: 600; }
.activity-list time { color: var(--muted); font-size: .75rem; margin-top: .4rem; display: block; }
@media(max-width:767px) { .activity-panel { padding: .5rem 1.25rem; } }
</style>
