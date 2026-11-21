<script setup lang="ts">
import LecturerSignaturePanel from './LecturerSignaturePanel.vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { apiMessage, initials, roleLabels } from '~/utils/format'
import type { User } from '~/types/user'
const auth = useAuth()
const form = reactive({ full_name: auth.user.value?.full_name || '', email: auth.user.value?.email || '', phone: auth.user.value?.phone || '', expertise: auth.user.value?.expertise || '' })
const passwords = reactive({ current_password: '', new_password: '' })
const saving = shallowRef(false)
const changing = shallowRef(false)
const error = shallowRef('')
const message = shallowRef('')
const passwordError = shallowRef('')
const isAdmin = computed(() => auth.user.value?.roles.includes('ADMIN'))
const isLecturer = computed(() => auth.user.value?.roles.includes('DOSEN'))
async function save() {
  if (saving.value) return
  saving.value = true; error.value = ''; message.value = ''
  try { await $fetch<{ user: User }>('/api/v1/me', { method: 'PUT', body: form }); await auth.load(); message.value = 'Profil berhasil diperbarui.' }
  catch (e) { error.value = apiMessage(e) }
  finally { saving.value = false }
}
async function changePassword() {
  if (changing.value) return
  changing.value = true; passwordError.value = ''
  try { await $fetch('/api/v1/auth/password', { method: 'PUT', body: passwords }); await auth.load(); await navigateTo('/login?changed=1') }
  catch (e) { passwordError.value = apiMessage(e) }
  finally { changing.value = false }
}
</script>

<template>
  <section><div class="profile-grid"><div class="panel profile-panel"><div class="profile-identity"><span class="profile-avatar">{{ initials(auth.user.value?.full_name || '') }}</span><div><h2>{{ auth.user.value?.full_name }}</h2><p>{{ auth.user.value?.roles.map(role => roleLabels[role]).join(' · ') }}</p></div></div><form @submit.prevent="save"><div class="field-grid"><div class="field full"><label for="profile-name">Nama lengkap</label><input id="profile-name" v-model="form.full_name" autocomplete="name" required minlength="2" maxlength="150"></div><div class="field full"><label for="profile-email">Email</label><input id="profile-email" v-model="form.email" type="email" autocomplete="email" required maxlength="254"></div><div v-if="!isAdmin" class="field full"><label for="profile-phone">Telepon</label><input id="profile-phone" v-model="form.phone" type="tel" autocomplete="tel" maxlength="30"></div><div v-if="isLecturer" class="field full"><label for="profile-expertise">Keahlian</label><textarea id="profile-expertise" v-model="form.expertise" rows="3" maxlength="2000" /></div></div><p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="message" class="notice success" role="status">{{ message }}</p><button class="button primary save-profile" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan profil' }}</button></form></div><div id="password-settings" class="panel password-panel"><h2>Kata sandi</h2><p>Setelah diubah, seluruh sesi akun berakhir. Masuk kembali dengan kata sandi baru.</p><form @submit.prevent="changePassword"><div class="field"><label for="current-password">Kata sandi saat ini</label><input id="current-password" v-model="passwords.current_password" type="password" autocomplete="current-password" required></div><div class="field"><label for="new-password">Kata sandi baru</label><input id="new-password" v-model="passwords.new_password" type="password" autocomplete="new-password" required minlength="12" maxlength="72"><small>Gunakan 12–72 byte. Hindari menggunakan ulang kata sandi lama.</small></div><p v-if="passwordError" class="notice error" role="alert">{{ passwordError }}</p><button class="button secondary" :disabled="changing">{{ changing ? 'Mengubah…' : 'Ubah kata sandi' }}</button></form></div></div><LecturerSignaturePanel v-if="isLecturer" /></section>
</template>

<style scoped>
.profile-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; align-items: start; }
.profile-panel,.password-panel { padding: 2rem; }
.password-panel { scroll-margin-top: 5.5rem; }
.profile-identity { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.profile-avatar { display: grid; place-items: center; width: 54px; height: 54px; background: var(--panel); border: 1px solid var(--border); color: var(--accent); border-radius: 50%; font-weight: 600; }
h2 { font-size: 1.125rem; font-weight: 600; letter-spacing: -.02em; }
.profile-identity p { color: var(--muted); font-size: .9375rem; margin-top: .375rem; }
.password-panel > p { color: var(--muted); font-size: 1rem; line-height: 1.65; margin: .75rem 0 1.5rem; }
.profile-identity > div { min-width: 0; overflow-wrap: anywhere; }
.profile-avatar { flex-shrink: 0; }
.password-panel .field { margin-bottom: 1.25rem; }
.save-profile { margin-top: 1.5rem; }
.notice { margin-top: 1rem; }
@media(max-width:1023px) { .profile-grid { grid-template-columns: 1fr; } }
@media(max-width:767px) { .profile-panel,.password-panel { padding: 1.25rem; } }
</style>
