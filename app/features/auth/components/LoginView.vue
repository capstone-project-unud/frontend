<script setup lang="ts">
import CampusIllustration from './CampusIllustration.vue'
import LoginForm from './LoginForm.vue'
import { useAuth } from '../composables/useAuth'
import { apiMessage } from '~/utils/format'
const auth = useAuth()
const route = useRoute()
const busy = shallowRef(false)
const error = shallowRef('')
async function submit(email: string, password: string) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await auth.login(email, password)
    await navigateTo(auth.user.value?.roles.includes('ADMIN') ? '/admin/users' : '/account')
  } catch (e) { error.value = apiMessage(e) }
  finally { busy.value = false }
}
</script>

<template>
  <main class="login-page">
    <section class="story-panel" aria-label="Capstone Project Udayana">
      <div class="story-brand"><span class="wordmark">capstone.</span><span class="institution">Teknologi Informasi<br>Universitas Udayana</span></div>
      <div class="story-art"><CampusIllustration /></div>
      <div class="story-copy"><p class="eyebrow">Ruang untuk berproses.</p><h1>Dari ide,<br>menjadi karya.</h1><p>Tempat perjalanan Capstone Project Anda<br class="desktop-break"> tumbuh, terarah, dan terdokumentasi.</p></div>
      <div class="story-footer"><span>Sistem Layanan Capstone Project</span><span>PSTI / Unud</span></div>
    </section>
    <section class="login-panel" aria-labelledby="login-heading">
      <div class="login-panel-top">Portal akademik <span class="small-dot" aria-hidden="true" /></div>
      <div class="login-content"><p class="eyebrow">Mari lanjutkan perjalanan Anda</p><h2 id="login-heading">Selamat datang.</h2><p class="login-subtitle">Masuk dengan akun yang telah<br>disiapkan oleh admin program studi.</p><p v-if="route.query.changed === '1'" class="notice success password-changed" role="status">Kata sandi berhasil diubah. Silakan masuk kembali.</p><LoginForm :busy="busy" :error="error" @submit="submit" /></div>
      <p class="login-footer">Satu akun, sesuai peran Anda.<br><span>Mahasiswa · Dosen · Admin</span></p>
    </section>
  </main>
</template>

<style scoped>
.login-page { display: grid; grid-template-columns: 7fr 3fr; min-height: 100dvh; background: white; }
.story-panel { position: relative; display: flex; flex-direction: column; background: var(--sage); padding: 2.5rem 3.25rem 1.75rem; color: #263f33; min-width: 0; }
.story-brand { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.wordmark { font-size: 2rem; font-weight: 650; letter-spacing: -.07em; }
.institution { font-size: .75rem; line-height: 1.6; text-align: right; }
.story-art { width: 92%; margin: 1rem auto -2.5rem; flex: 1; display: flex; align-items: center; justify-content: center; }
.story-copy { position: relative; padding: 0 0 2.75rem; }
.story-copy .eyebrow { color: #344e40; margin-bottom: .875rem; }
.story-copy h1 { font-size: clamp(2.5rem,4.1vw,4rem); line-height: 1.05; font-weight: 500; letter-spacing: -.045em; }
.story-copy > p:last-child { margin-top: 1.25rem; font-size: .9375rem; line-height: 1.65; }
.story-footer { display: flex; justify-content: space-between; border-top: 1px solid #6a8c78; padding-top: 1rem; font-size: .6875rem; }
.login-panel { padding: 2.75rem clamp(1.5rem,2.8vw,3.5rem) 2rem; display: flex; flex-direction: column; min-width: 0; }
.login-panel-top { display: flex; justify-content: space-between; align-items: center; font-size: .75rem; color: var(--muted); }
.small-dot { width: 8px; height: 8px; border-radius: 50%; background: #315747; }
.login-content { width: 100%; max-width: 320px; margin: auto; padding: 3rem 0; }
.login-content .eyebrow { font-size: .75rem; margin-bottom: 1rem; }
.login-content h2 { font-size: clamp(1.75rem,2.3vw,2.25rem); letter-spacing: -.04em; font-weight: 600; line-height: 1.2; }
.login-subtitle { margin-top: .875rem; font-size: .875rem; color: var(--muted); line-height: 1.65; }
.password-changed { margin-top: 1rem; }
.login-footer { text-align: center; font-size: .75rem; line-height: 1.8; color: var(--muted); }
.login-footer span { font-size: .6875rem; }
@media(min-width:1600px) { .story-art { max-height: 620px; } }
@media(min-width:768px) and (max-width:1199px) { .login-page { grid-template-columns: 55fr 45fr; } .story-panel { padding: 2rem; } .story-art { width: 120%; margin-left: -10%; } .institution { display: none; } }
@media(max-width:767px) { .login-page { display: block; } .story-panel { padding: 1.25rem 1.5rem; min-height: 215px; overflow: hidden; } .story-brand { z-index: 1; } .wordmark { font-size: 1.6rem; } .institution { font-size: .625rem; } .story-art { position: absolute; width: 250px; right: -35px; bottom: 0; margin: 0; } .story-copy { padding: 1.5rem 0 0; z-index: 1; max-width: 55%; } .story-copy h1 { font-size: 2rem; } .story-copy .eyebrow, .story-copy > p:last-child,.story-footer { display: none; } .login-panel { padding: 1.5rem 1.75rem 2rem; min-height: calc(100dvh - 215px); } .login-content { padding: 2.5rem 0; max-width: 400px; } .login-panel-top { display: none; } .login-subtitle br { display: none; } }
</style>
