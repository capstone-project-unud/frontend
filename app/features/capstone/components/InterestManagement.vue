<script setup lang="ts">
import type { Interest } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
const api = useCapstone()
const { busy, error, message } = api
const fetcher = useRequestFetch()
const { data, status, error: loadError, refresh } = await useAsyncData('capstone-interests', () => fetcher<{ items: Interest[] }>(capstoneAPI + '/interests'))
const name = shallowRef(''), selected = shallowRef<Interest | null>(null)
const dialog = useTemplateRef<HTMLDialogElement>('editor')
const editing = shallowRef(false)
function open(interest?: Interest) {
  selected.value = interest || null
  name.value = interest?.name || ''
  error.value = ''
  editing.value = true
  dialog.value?.showModal()
}
function close() { if (!busy.value) { dialog.value?.close(); editing.value = false } }
async function save() {
  if (await api.mutate(selected.value ? '/interests/' + selected.value.id : '/interests', { name: name.value, is_active: selected.value?.is_active ?? true }, selected.value ? 'PUT' : 'POST')) {
    dialog.value?.close(); editing.value = false
    name.value = ''; selected.value = null
    await refresh()
  }
}
async function toggle(i: Interest) { if (await api.mutate('/interests/' + i.id, { name: i.name, is_active: !i.is_active }, 'PUT')) await refresh() }
</script>

<template>
  <section aria-labelledby="interests-heading">
    <header class="page-heading"><div><h1 id="interests-heading">Bidang minat</h1><p>Kelola pilihan bidang minat untuk pendaftaran judul.</p></div></header>
    <p v-if="error && !editing" role="alert" class="notice error cap-feedback">{{ error }}</p>
    <p v-if="message" role="status" class="notice success cap-feedback">{{ message }}</p>
    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title"><h2>Daftar bidang minat</h2><span>{{ data?.items.length ?? '—' }} bidang minat</span></div>
        <div class="workspace-panel-actions"><button class="button primary" @click="open()"><span aria-hidden="true" class="cap-plus">+</span> Tambah bidang minat</button></div>
      </div>
      <div v-if="status === 'pending'" role="status" class="empty-state"><p>Memuat bidang minat…</p></div>
      <div v-else-if="loadError" class="empty-state"><h3>Daftar belum dapat dimuat</h3><p>Periksa koneksi lalu coba kembali.</p><button class="button secondary" @click="refresh()">Coba lagi</button></div>
      <div v-else-if="!data?.items.length" class="empty-state"><h3>Belum ada bidang minat</h3><p>Tambahkan bidang minat resmi program studi untuk formulir pendaftaran.</p></div>
      <div v-else class="workspace-table cap-table-wrap" tabindex="0" aria-label="Daftar bidang minat">
        <table class="workspace-table cap-table cap-record-table"><caption class="visually-hidden">Bidang minat pendaftaran capstone</caption><thead><tr><th scope="col">Nama bidang minat</th><th scope="col">Status</th><th scope="col" class="cap-action-heading">Aksi</th></tr></thead><tbody>
          <tr v-for="interest in data.items" :key="interest.id"><td><strong>{{ interest.name }}</strong></td><td><span :class="interest.is_active ? 'cap-success' : 'muted'">{{ interest.is_active ? 'Aktif' : 'Nonaktif' }}</span></td><td class="cap-row-actions"><button class="workspace-text-action" :disabled="busy" :aria-label="'Ubah ' + interest.name" @click="open(interest)">Ubah</button><button class="workspace-text-action secondary" :disabled="busy" :aria-label="(interest.is_active ? 'Nonaktifkan ' : 'Aktifkan ') + interest.name" @click="toggle(interest)">{{ interest.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button></td></tr>
        </tbody></table>
      </div>
    </div>
    <dialog ref="editor" class="cap-dialog" aria-labelledby="interest-editor-title" @cancel.prevent="close">
      <form @submit.prevent="save">
        <h2 id="interest-editor-title">{{ selected ? 'Ubah bidang minat' : 'Tambah bidang minat' }}</h2>
        <div class="field"><label for="interest-name">Nama bidang minat</label><input id="interest-name" v-model="name" required minlength="2" maxlength="150" :disabled="busy" autofocus></div>
        <p v-if="error" role="alert" class="notice error">{{ error }}</p>
        <div class="cap-dialog-actions"><button type="button" class="button secondary" :disabled="busy" @click="close">Batal</button><button class="button primary" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan bidang minat' }}</button></div>
      </form>
    </dialog>
  </section>
</template>
