<script setup lang="ts">
import { useUsers } from '../composables/useUsers'
import UserFilters from './UserFilters.vue'
import UserTable from './UserTable.vue'
import UserEditor from './UserEditor.vue'
import type { User, UserInput } from '~/types/user'
import { apiMessage } from '~/utils/format'
const users = useUsers()
const { data: list, status: listStatus, error: listError } = users.list
const { data: stats, error: statsError } = users.stats
const { message, mutationError, saving, page, params } = users
const editorOpen = shallowRef(false)
const selected = shallowRef<User | null>(null)
const statusTarget = shallowRef<User | null>(null)
const confirmDialog = useTemplateRef<HTMLDialogElement>('confirmDialog')
const pages = computed(() => Math.max(1, Math.ceil((list.value?.total || 0) / 12)))
function edit(user: User | null) { mutationError.value = ''; selected.value = user; editorOpen.value = true }
async function save(input: UserInput) { if (await users.save(input, selected.value)) editorOpen.value = false }
async function resetPassword(password: string) { if (selected.value && await users.resetPassword(selected.value, password)) editorOpen.value = false }
async function confirmStatus(user: User) { mutationError.value = ''; statusTarget.value = user; await nextTick(); confirmDialog.value?.showModal() }
function cancelStatus() { if (!saving.value) { confirmDialog.value?.close(); statusTarget.value = null } }
async function changeStatus() { if (statusTarget.value && await users.setStatus(statusTarget.value)) { confirmDialog.value?.close(); statusTarget.value = null } }
</script>

<template>
  <section aria-labelledby="users-heading"><div class="page-heading"><div><h1 id="users-heading">Manajemen pengguna</h1><p>Kelola akun, identitas akademik, dan akses pengguna.</p></div><button class="button primary" @click="edit(null)"><span aria-hidden="true" class="plus">+</span>Tambah pengguna</button></div>
    <p v-if="statsError" class="notice error" role="alert">Ringkasan belum dapat dimuat. <button class="text-button" @click="users.stats.refresh()">Coba lagi</button></p>
    <div class="statistics" aria-label="Ringkasan pengguna"><div><span>Total pengguna</span><strong>{{ stats?.total ?? '—' }}</strong></div><div><span>Mahasiswa</span><strong>{{ stats?.students ?? '—' }}</strong></div><div><span>Dosen</span><strong>{{ stats?.lecturers ?? '—' }}</strong></div><div><span>Akun aktif</span><strong>{{ stats?.active ?? '—' }}</strong></div></div>
    <p v-if="message" class="notice success feedback" role="status">{{ message }}</p><p v-if="mutationError && !editorOpen && !statusTarget" class="notice error feedback" role="alert">{{ mutationError }}</p>
    <div class="panel users-panel"><div class="section-heading"><h2>Daftar pengguna</h2><span>{{ list?.total ?? '—' }} pengguna</span></div><UserFilters :query="params" @change="users.filters" />
      <div v-if="listStatus === 'pending'" class="empty-state" role="status"><p>Memuat daftar pengguna…</p></div>
      <div v-else-if="listError" class="empty-state"><h3>Daftar belum dapat dimuat</h3><p>{{ apiMessage(listError) }}</p><button class="button secondary" @click="users.refresh">Coba lagi</button></div>
      <UserTable v-else-if="list?.items.length" :users="list.items" :busy="saving" @edit="edit" @status="confirmStatus" />
      <div v-else class="empty-state"><h3>{{ params.q || params.role || params.status ? 'Tidak ada pengguna yang cocok' : 'Belum ada pengguna' }}</h3><p>{{ params.q || params.role || params.status ? 'Coba kata kunci lain atau atur ulang filter Anda.' : 'Tambahkan akun mahasiswa atau dosen untuk memulai.' }}</p><button v-if="!params.q && !params.role && !params.status" class="button primary" @click="edit(null)">Tambah pengguna</button></div>
      <div class="pagination"><span>{{ list?.total ? `Halaman ${page} dari ${pages}` : 'Tidak ada hasil' }}</span><div><button class="button pager" :disabled="page <= 1 || listStatus === 'pending'" aria-label="Halaman sebelumnya" @click="page--">Sebelumnya</button><button class="button pager" :disabled="page >= pages || listStatus === 'pending'" aria-label="Halaman berikutnya" @click="page++">Berikutnya</button></div></div>
    </div>
    <UserEditor v-if="editorOpen" :user="selected" :busy="saving" :error="mutationError" @save="save" @reset="resetPassword" @close="editorOpen = false" />
    <dialog v-if="statusTarget" ref="confirmDialog" class="confirm-dialog" aria-labelledby="status-title" @cancel.prevent="cancelStatus"><h2 id="status-title">{{ statusTarget.is_active ? 'Nonaktifkan akun?' : 'Aktifkan akun?' }}</h2><p>{{ statusTarget.full_name }} {{ statusTarget.is_active ? 'akan kehilangan akses ke sistem. Data dan riwayatnya tetap tersimpan.' : 'akan dapat masuk kembali menggunakan akun yang sama.' }}</p><p v-if="mutationError" class="notice error" role="alert">{{ mutationError }}</p><div><button class="button secondary" :disabled="saving" @click="cancelStatus">Batal</button><button class="button" :class="statusTarget.is_active ? 'danger' : 'primary'" :disabled="saving" @click="changeStatus">{{ saving ? 'Menyimpan…' : statusTarget.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun' }}</button></div></dialog>
  </section>
</template>

<style scoped>
.plus { font-size: 1.25rem; font-weight: 400; line-height: 1; }
.statistics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); margin: 2.5rem 0 2rem; }
.statistics > div { padding-left: 2rem; border-left: 1px solid #dedfda; }
.statistics > div:first-child { padding-left: 0; border: 0; }
.statistics > div > span { font-size: .9375rem; color: var(--muted); }
.statistics strong { display: flex; gap: .75rem; align-items: center; margin-top: .5rem; font-size: 2.25rem; letter-spacing: -.04em; font-weight: 500; line-height: 1.15; }
.feedback { margin-bottom: 1.25rem; }
.users-panel { min-width: 0; container: users / inline-size; }
.section-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1.5rem 1.5rem .5rem; }
.section-heading h2 { font-size: 1.125rem; font-weight: 600; letter-spacing: -.02em; }
.section-heading > span { color: var(--muted); font-size: .875rem; }
.pagination { padding: 1rem 1.5rem; border-top: 1px solid var(--line); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; align-items: center; font-size: .875rem; color: var(--muted); }
.pagination > div { display: flex; gap: .5rem; }
.pager { font-size: .875rem; background: white; border-color: #85858d; padding: .5rem .75rem; }
.pager:disabled { background: #f5f5f3; border-color: #dededb; cursor: default; }
.confirm-dialog { width: min(460px,calc(100% - 2rem)); padding: 2rem; border: none; border-radius: 20px; color: var(--ink); box-shadow: 0 20px 80px #15131f30; }
.confirm-dialog::backdrop { background: #1c1a2755; }
.confirm-dialog h2 { font-size: 1.5rem; font-weight: 550; letter-spacing: -.02em; }
.confirm-dialog p { margin-top: 1rem; font-size: 1rem; line-height: 1.65; color: var(--muted); }
.confirm-dialog > div { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1.5rem; }
@media(min-width:768px) and (max-width:1199px) { .statistics > div { padding-left: 1rem; } .page-heading { flex-direction: column; align-items: flex-start; } }
@media(max-width:767px) { .statistics { grid-template-columns: 1fr 1fr; gap: 1.5rem 1rem; margin-block: 1.5rem; } .statistics > div { padding-left: 1rem; } .statistics > div:nth-child(3) { padding-left: 0; border: 0; } .statistics strong { font-size: 2rem; } .section-heading { padding: 1.25rem 1rem .5rem; } .pagination { padding: 1rem; } }
</style>
