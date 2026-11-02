<script setup lang="ts">
import type { User } from '~/types/user'
import { initials, roleLabels } from '~/utils/format'
defineProps<{ users: User[]; busy: boolean }>()
defineEmits<{ edit: [user: User]; status: [user: User] }>()
</script>

<template>
  <table class="user-table"><caption class="sr-only">Daftar pengguna Capstone Project</caption><thead><tr><th scope="col">Nama pengguna</th><th scope="col">Identitas akademik</th><th scope="col">Peran</th><th scope="col">Status</th><th scope="col" class="action-heading">Tindakan</th></tr></thead><tbody>
    <tr v-for="user in users" :key="user.id"><td><div class="user-identity"><span class="user-avatar" :class="{ lecturer: user.roles.includes('DOSEN'), admin: user.roles.includes('ADMIN') }">{{ initials(user.full_name) }}</span><div><strong>{{ user.full_name }}</strong><span>{{ user.email }}</span></div></div></td><td class="academic"><span v-if="user.nim">{{ user.nim }}<small>Angkatan {{ user.admission_year }}</small></span><span v-else-if="user.nip || user.nidn">{{ user.nip || user.nidn }}<small>{{ user.nip ? 'NIP' : 'NIDN' }}</small></span><span v-else class="muted">—</span></td><td><div class="roles"><span v-for="role in user.roles" :key="role" class="role">{{ roleLabels[role] }}</span></div></td><td><span class="status" :class="{ inactive: !user.is_active }">{{ user.is_active ? 'Aktif' : 'Nonaktif' }}</span></td><td class="actions"><NuxtLink v-if="user.roles.includes('ADMIN')" class="text-button" to="/account">Profil saya</NuxtLink><template v-else><button class="text-button" :disabled="busy" :aria-label="`Ubah ${user.full_name}`" @click="$emit('edit', user)">Ubah</button><button class="text-button status-action" :disabled="busy" :aria-label="`${user.is_active ? 'Nonaktifkan' : 'Aktifkan'} ${user.full_name}`" @click="$emit('status', user)">{{ user.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button></template></td></tr>
  </tbody></table>
</template>

<style scoped>
.user-table { width: 100%; border-collapse: collapse; text-align: left; }
.sr-only { position: absolute; clip-path: inset(50%); width: 1px; height: 1px; overflow: hidden; }
th { color: var(--muted); background: #f9f9f7; font-size: .875rem; font-weight: 600; padding: 1rem; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
th:first-child,td:first-child { padding-left: 1.5rem; }
td { border-bottom: 1px solid #eeeeeb; padding: 1.125rem 1rem; font-size: .9375rem; }
tbody tr:last-child td { border-bottom: 0; }
.user-identity { display: flex; align-items: center; gap: .75rem; min-width: 0; }
.user-avatar { display: grid; place-items: center; flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; background: #e7ede2; color: #405535; font-weight: 600; font-size: .875rem; }
.user-avatar.lecturer { background: #f4e8dc; color: #805638; }
.user-avatar.admin { background: #e9e3f7; color: #64419d; }
.user-identity strong { font-weight: 600; display: block; overflow-wrap: anywhere; }
.user-identity div { min-width: 0; }
.user-identity div > span { display: block; color: var(--muted); font-size: .875rem; margin-top: .25rem; overflow-wrap: anywhere; }
.academic { overflow-wrap: anywhere; }
.academic small { display: block; margin-top: .25rem; font-size: .875rem; color: var(--muted); }
.roles { display: flex; gap: .3rem; flex-wrap: wrap; }
.role { font-size: .875rem; font-weight: 600; padding: .3rem .5rem; background: #f1f1ee; border-radius: 5px; color: #51515b; }
.status { display: inline-flex; color: #285e46; font-size: .9375rem; font-weight: 600; }
.status.inactive { color: #6a6467; }
.actions { white-space: nowrap; text-align: right; padding-right: 1.5rem; }
.actions .text-button { font-size: .9375rem; display: inline-flex; align-items: center; }
.status-action { color: var(--muted); }
.action-heading { text-align: right; padding-right: 1.5rem; }
@container users (max-width: 900px) { .actions .text-button { display: flex; justify-content: flex-end; margin-left: auto; } }
@container users (max-width: 700px) { .user-table,.user-table tbody { display: block; } thead { display: none; } tbody tr { display: grid; grid-template-columns: minmax(0,1fr) auto; padding: 1.25rem 1rem; gap: .75rem; border-top: 1px solid var(--line); } td,td:first-child { padding: 0; border: 0; min-width: 0; } td:first-child { grid-column: 1 / -1; } .academic { grid-column: 1 / -1; } .academic small { display: inline; margin-left: .5rem; } .actions { grid-column: 1 / -1; border-top: 1px solid var(--line); padding-top: .5rem; white-space: normal; } .actions .text-button { display: inline-flex; } }
</style>
