<script setup lang="ts">
import type { Role, User, UserInput } from '~/types/user'
import UserPasswordReset from './UserPasswordReset.vue'

const props = defineProps<{ user: User | null; busy: boolean; error: string }>()
const emit = defineEmits<{ save: [input: UserInput]; reset: [password: string]; close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')

const koprodi = shallowRef(props.user?.roles.includes('KOPRODI') || false)
const form = reactive({
  full_name: props.user?.full_name || '',
  email: props.user?.email || '',
  nip: props.user?.nip || '',
  nidn: props.user?.nidn || '',
  phone: props.user?.phone || '',
  expertise: props.user?.expertise || '',
  password: '',
  is_active: props.user?.is_active ?? true,
})
const visible = shallowRef(false)

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())

function close() {
  if (!props.busy) emit('close')
}

function save() {
  const roles: Role[] = ['DOSEN']
  if (koprodi.value) roles.push('KOPRODI')

  emit('save', {
    full_name: form.full_name,
    email: form.email,
    roles,
    nim: null,
    admission_year: null,
    nip: form.nip || null,
    nidn: form.nidn || null,
    phone: form.phone,
    expertise: form.expertise,
    password: props.user ? undefined : form.password,
    is_active: props.user ? undefined : form.is_active,
  })
}
</script>

<template>
  <dialog ref="dialog" class="editor-dialog" aria-labelledby="lecturer-editor-title" @cancel.prevent="close">
    <div class="dialog-header">
      <div class="header-text">
        <h2 id="lecturer-editor-title">{{ user ? 'Ubah Dosen' : 'Tambah Dosen' }}</h2>
        <p class="dialog-intro">
          {{ user ? 'Perbarui informasi dan identitas akademik dosen.' : 'Tambahkan akun dosen baru program studi.' }}
        </p>
      </div>
      <button class="close-button" type="button" aria-label="Tutup formulir" :disabled="busy" @click="close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <form @submit.prevent="save">
      <div class="dialog-body">
        <fieldset :disabled="busy">
          <div class="field-grid">
            <div class="field full">
              <label for="lecturer-name">Nama lengkap & gelar</label>
              <input id="lecturer-name" v-model="form.full_name" autocomplete="name" required minlength="2" maxlength="150" placeholder="Contoh: Dr. Ir. Wayan Suartika, M.T.">
            </div>

            <div class="field full">
              <label for="lecturer-email">Email institusi</label>
              <input id="lecturer-email" v-model="form.email" type="email" autocomplete="email" required maxlength="254" placeholder="dosen@unud.ac.id">
            </div>

            <div class="field">
              <label for="lecturer-nip">NIP <span class="optional">(opsional)</span></label>
              <input id="lecturer-nip" v-model="form.nip" maxlength="30" placeholder="Nomor induk pegawai">
            </div>

            <div class="field">
              <label for="lecturer-nidn">NIDN <span class="optional">(opsional)</span></label>
              <input id="lecturer-nidn" v-model="form.nidn" maxlength="30" placeholder="Nomor induk dosen">
            </div>

            <label class="check-card full">
              <input v-model="koprodi" type="checkbox" class="modern-checkbox">
              <div class="check-text">
                <strong>Tetapkan peran Koordinator Program Studi (Koprodi)</strong>
                <span>Dosen ini akan memiliki hak kelola akademik dan plotting pembimbing</span>
              </div>
            </label>

            <div class="field full">
              <label for="lecturer-phone">Nomor telepon <span class="optional">(opsional)</span></label>
              <input id="lecturer-phone" v-model="form.phone" type="tel" autocomplete="tel" maxlength="30" placeholder="Nomor WhatsApp / telepon aktif">
            </div>

            <div class="field full">
              <label for="lecturer-expertise">Bidang keahlian <span class="optional">(opsional)</span></label>
              <textarea id="lecturer-expertise" v-model="form.expertise" rows="2" maxlength="2000" placeholder="Topik penelitian atau minat riset dosen" />
            </div>

            <div v-if="!user" class="field full">
              <label for="lecturer-password">Kata sandi awal</label>
              <div class="password-input-wrapper">
                <input
                  id="lecturer-password"
                  v-model="form.password"
                  :type="visible ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="12"
                  maxlength="72"
                  placeholder="Minimal 12 karakter"
                >
                <button type="button" class="password-toggle" :aria-pressed="visible" @click="visible = !visible">
                  {{ visible ? 'Sembunyikan' : 'Lihat' }}
                </button>
              </div>
              <small>Sampaikan kata sandi ini secara aman kepada dosen yang bersangkutan.</small>
            </div>

            <label v-if="!user" class="check-card full">
              <input v-model="form.is_active" type="checkbox" class="modern-checkbox">
              <div class="check-text">
                <strong>Aktifkan akun segera</strong>
                <span>Dosen langsung dapat masuk menggunakan akun ini</span>
              </div>
            </label>
          </div>
        </fieldset>

        <p v-if="error" class="notice error" role="alert">{{ error }}</p>
      </div>

      <div class="dialog-actions">
        <button class="button secondary" type="button" :disabled="busy" @click="close">Batal</button>
        <button class="button primary submit-btn" type="submit" :disabled="busy">
          {{ busy ? 'Menyimpan…' : user ? 'Simpan perubahan' : 'Buat akun dosen' }}
        </button>
      </div>
    </form>

    <UserPasswordReset v-if="user" :busy="busy" @reset="emit('reset', $event)" />
  </dialog>
</template>

<style scoped>
.editor-dialog {
  width: min(560px, calc(100% - 2rem));
  max-height: calc(100dvh - 2.5rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 24px;
  color: var(--ink);
  background: var(--panel);
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.45);
  animation: dialogPop 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.editor-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 2rem 1.25rem;
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.03em;
  color: var(--ink);
}

.dialog-intro {
  color: var(--muted);
  font-size: .9375rem;
  line-height: 1.5;
  margin-top: .35rem;
}

.close-button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  color: var(--muted);
  cursor: pointer;
  transition: color 150ms ease, transform 180ms ease;
}

.close-button:hover {
  background: transparent;
  color: var(--ink);
  transform: rotate(90deg);
}

.dialog-body {
  padding: 0 2rem 1.5rem;
  max-height: calc(100dvh - 16rem);
  overflow-y: auto;
  scrollbar-width: thin;
}

fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}

.field label {
  font-size: .875rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: .35rem;
}

.optional {
  color: var(--muted);
  font-weight: 400;
  font-size: .8125rem;
  margin-left: .25rem;
}

/* Modern Password Input */
.password-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 180ms ease;
  overflow: hidden;
}

.password-input-wrapper:hover {
  border-color: var(--border-hover);
  background: var(--panel);
}

.password-input-wrapper:focus-within {
  border-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 0 0 3px rgba(103, 65, 207, 0.12);
}

.password-input-wrapper input {
  flex: 1;
  border: 0;
  background: transparent;
  color: var(--ink);
  padding: .65rem 1rem;
  box-shadow: none;
  font-size: .95rem;
}

.password-input-wrapper input:focus-visible {
  outline: none;
}

.password-toggle {
  border: 0;
  background: transparent;
  color: var(--accent);
  font-size: .875rem;
  font-weight: 600;
  padding: .5rem .85rem;
  cursor: pointer;
  transition: opacity 150ms ease;
}

.password-toggle:hover {
  opacity: .8;
}

/* Modern Check Card */
.check-card {
  display: flex;
  align-items: flex-start;
  gap: .875rem;
  padding: .875rem 1rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;
}

.check-card:hover {
  background: var(--panel-hover);
  border-color: var(--border-hover);
}

.modern-checkbox {
  width: 18px;
  height: 18px;
  margin-top: .15rem;
  accent-color: var(--accent);
  cursor: pointer;
}

.check-text strong {
  display: block;
  font-size: .875rem;
  font-weight: 600;
  color: var(--ink);
}

.check-text span {
  display: block;
  font-size: .8125rem;
  color: var(--muted);
  margin-top: .15rem;
}

.dialog-body .notice {
  margin-top: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  border-top: 1px solid var(--line);
  padding: 1.25rem 2rem;
  background: var(--canvas);
}

.submit-btn {
  box-shadow: 0 4px 14px rgba(103, 65, 207, 0.28);
}

@keyframes dialogPop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 767px) {
  .dialog-header { padding: 1.25rem 1.25rem 1rem; }
  .dialog-body { padding: 0 1.25rem 1.25rem; }
  .dialog-actions { padding: 1rem 1.25rem; position: sticky; bottom: 0; }
}
</style>
