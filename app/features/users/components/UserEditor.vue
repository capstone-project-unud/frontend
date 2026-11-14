<script setup lang="ts">
import type { Role, User, UserInput } from '~/types/user'
import UserPasswordReset from './UserPasswordReset.vue'
const props = defineProps<{ user: User | null; busy: boolean; error: string }>()
const emit = defineEmits<{ save: [input: UserInput]; reset: [password: string]; close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const baseRole = shallowRef<'MAHASISWA' | 'DOSEN'>(props.user?.roles.includes('DOSEN') ? 'DOSEN' : 'MAHASISWA')
const koprodi = shallowRef(props.user?.roles.includes('KOPRODI') || false)
const form = reactive({ full_name: props.user?.full_name || '', email: props.user?.email || '', nim: props.user?.nim || '', admission_year: props.user?.admission_year || new Date().getFullYear(), nip: props.user?.nip || '', nidn: props.user?.nidn || '', phone: props.user?.phone || '', expertise: props.user?.expertise || '', password: '', is_active: props.user?.is_active ?? true })
const visible = shallowRef(false)
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
function close() { if (!props.busy) emit('close') }
function save() {
  const roles: Role[] = [baseRole.value]
  if (baseRole.value === 'DOSEN' && koprodi.value) roles.push('KOPRODI')
  emit('save', { ...form, roles, nim: baseRole.value === 'MAHASISWA' ? form.nim : null, admission_year: baseRole.value === 'MAHASISWA' ? Number(form.admission_year) : null, nip: baseRole.value === 'DOSEN' ? form.nip || null : null, nidn: baseRole.value === 'DOSEN' ? form.nidn || null : null, password: props.user ? undefined : form.password })
}
</script>

<template>
  <dialog ref="dialog" class="editor-dialog" aria-labelledby="editor-title" @cancel.prevent="close">
    <div class="dialog-header"><h2 id="editor-title">{{ user ? 'Ubah pengguna' : 'Tambah pengguna' }}</h2><button class="close-button" type="button" aria-label="Tutup formulir" :disabled="busy" @click="close">×</button></div>
    <form @submit.prevent="save"><div class="dialog-body"><p class="dialog-intro">{{ user ? 'Perbarui informasi akun dan identitas akademik pengguna.' : 'Siapkan akun untuk mahasiswa atau dosen program studi.' }}</p><fieldset :disabled="busy"><div class="field-grid">
      <div class="field full"><label for="user-role">Jenis pengguna</label><select id="user-role" v-model="baseRole"><option value="MAHASISWA">Mahasiswa</option><option value="DOSEN">Dosen</option></select></div>
      <div class="field full"><label for="user-name">Nama lengkap</label><input id="user-name" v-model="form.full_name" autocomplete="name" required minlength="2" maxlength="150" placeholder="Nama lengkap pengguna"></div>
      <div class="field full"><label for="user-email">Email</label><input id="user-email" v-model="form.email" type="email" autocomplete="email" required maxlength="254" placeholder="nama@unud.ac.id"></div>
      <template v-if="baseRole === 'MAHASISWA'"><div class="field"><label for="user-nim">NIM</label><input id="user-nim" v-model="form.nim" required maxlength="30" placeholder="Nomor induk mahasiswa"></div><div class="field"><label for="user-year">Tahun angkatan</label><input id="user-year" v-model="form.admission_year" type="number" required min="2000" :max="new Date().getFullYear() + 1"></div></template>
      <template v-else><div class="field"><label for="user-nip">NIP <span class="optional">(opsional)</span></label><input id="user-nip" v-model="form.nip" maxlength="30" placeholder="Nomor induk pegawai"></div><div class="field"><label for="user-nidn">NIDN <span class="optional">(opsional)</span></label><input id="user-nidn" v-model="form.nidn" maxlength="30" placeholder="Nomor induk dosen"></div><label class="check-field full"><input v-model="koprodi" type="checkbox">Tambahkan peran Koprodi</label></template>
      <div class="field full"><label for="user-phone">Telepon <span class="optional">(opsional)</span></label><input id="user-phone" v-model="form.phone" type="tel" autocomplete="tel" maxlength="30" placeholder="Nomor telepon pengguna"></div>
      <div v-if="baseRole === 'DOSEN'" class="field full"><label for="user-expertise">Keahlian <span class="optional">(opsional)</span></label><textarea id="user-expertise" v-model="form.expertise" rows="2" maxlength="2000" placeholder="Bidang keahlian dosen" /></div>
      <div v-if="!user" class="field full"><label for="initial-password">Kata sandi awal</label><div class="password-row"><input id="initial-password" v-model="form.password" :type="visible ? 'text' : 'password'" autocomplete="new-password" required minlength="12" maxlength="72"><button type="button" class="text-button" :aria-pressed="visible" @click="visible = !visible">{{ visible ? 'Sembunyikan' : 'Lihat' }}</button></div><small>12–72 byte. Sampaikan secara pribadi kepada pemilik akun.</small></div>
      <label v-if="!user" class="check-field full"><input v-model="form.is_active" type="checkbox">Aktifkan akun setelah dibuat</label>
    </div></fieldset><p v-if="error" class="notice error" role="alert">{{ error }}</p></div><div class="dialog-actions"><button class="button secondary" type="button" :disabled="busy" @click="close">Batal</button><button class="button primary" type="submit" :disabled="busy">{{ busy ? 'Menyimpan…' : user ? 'Simpan perubahan' : 'Buat akun' }}</button></div></form>
    <UserPasswordReset v-if="user" :busy="busy" @reset="emit('reset', $event)" />
  </dialog>
</template>

<style scoped>
.editor-dialog { width: min(580px,calc(100% - 2rem)); max-height: calc(100dvh - 2rem); padding: 0; border: 0; border-radius: 24px; color: var(--ink); box-shadow: 0 24px 80px #15131f30; }
.editor-dialog::backdrop { background: #1c1a2755; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 1.75rem 2rem 1rem; }
.dialog-header h2 { font-size: 1.75rem; font-weight: 600; letter-spacing: -.03em; }
.close-button { border: 0; background: transparent; width: 36px; height: 36px; flex: 0 0 36px; font-size: 1.5rem; color: var(--muted); cursor: pointer; }
.dialog-body { padding: 0 2rem 1.5rem; }
.dialog-intro { color: var(--muted); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.optional { color: var(--muted); font-weight: 500; }
.password-row { display: flex; gap: .5rem; }
.password-row .text-button { padding-inline: .25rem; }
.dialog-body .notice { margin-top: 1rem; }
.dialog-actions { display: flex; justify-content: flex-end; gap: .75rem; border-top: 1px solid var(--line); padding: 1.25rem 2rem; background: var(--canvas); }
@media(max-width:767px) { .dialog-header { padding: 1.25rem; } .dialog-body { padding: 0 1.25rem 1.25rem; } .dialog-actions { padding: 1.25rem; position: sticky; bottom: 0; } }
</style>
