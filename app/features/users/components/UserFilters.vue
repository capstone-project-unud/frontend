<script setup lang="ts">
import type { Role } from '~/types/user'
const props = defineProps<{ query: { q: string; role: Role | ''; status: string } }>()
const emit = defineEmits<{ change: [value: { q: string; role: Role | ''; status: string }] }>()
const search = shallowRef(props.query.q)
const tabs: { value: Role | ''; label: string }[] = [{ value: '', label: 'Semua pengguna' }, { value: 'MAHASISWA', label: 'Mahasiswa' }, { value: 'DOSEN', label: 'Dosen' }, { value: 'ADMIN', label: 'Admin' }]
function changeRole(role: Role | '') { emit('change', { ...props.query, role }) }
</script>

<template>
  <div class="filters">
    <div class="role-tabs" aria-label="Filter peran"><button v-for="tab in tabs" :key="tab.value" type="button" :aria-pressed="query.role === tab.value" :class="{ selected: query.role === tab.value }" @click="changeRole(tab.value)">{{ tab.label }}</button></div>
    <form class="search-row" role="search" @submit.prevent="emit('change', { ...query, q: search })">
      <div class="search-input"><label class="visually-hidden" for="search-users">Cari nama, email, atau NIM</label><input id="search-users" v-model="search" type="search" placeholder="Cari nama, email, atau NIM…" maxlength="150"><button type="submit" class="search-submit">Cari</button></div>
      <label class="status-filter"><span class="visually-hidden">Status akun</span><select :value="query.status" @change="emit('change', { ...query, status: ($event.target as HTMLSelectElement).value })"><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label>
      <button v-if="query.q || query.status || query.role" class="text-button" type="button" @click="search = ''; emit('change', { q: '', role: '', status: '' })">Reset filter</button>
    </form>
  </div>
</template>

<style scoped>
.filters { padding: 0 1.5rem; }
.role-tabs { display: flex; gap: 1.75rem; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.role-tabs button { background: transparent; border: 0; border-bottom: 2px solid transparent; min-height: 56px; padding: .7rem 0; font-size: .8125rem; color: var(--muted); }
.role-tabs button.selected { color: var(--accent); border-bottom-color: var(--accent); font-weight: 650; }
.search-row { display: flex; align-items: center; gap: .75rem; padding: 1.25rem 0; flex-wrap: wrap; }
.search-input { flex: 1; display: flex; min-width: 200px; max-width: 420px; border: 1px solid #85858d; border-radius: 8px; }
.search-input input { border: 0; background: transparent; font-size: .8125rem; }
.search-submit { background: transparent; border: 0; padding: 0 .875rem; color: var(--accent); font-weight: 600; font-size: .8125rem; }
.status-filter { width: 160px; }
.status-filter select { font-size: .8125rem; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media(max-width:767px) { .filters { padding: 0 1rem; } .role-tabs { gap: 1.1rem; } .role-tabs button { font-size: .75rem; min-height: 50px; } .search-row { gap: .625rem; } .search-input { max-width: none; flex-basis: 100%; } .status-filter { flex: 1; } }
</style>
