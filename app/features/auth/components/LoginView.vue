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
    await navigateTo('/dashboard')
  } catch (e) { error.value = apiMessage(e) }
  finally { busy.value = false }
}
</script>

<template>
  <main class="login-page">
    <section class="story-panel" aria-label="Capstone Project Udayana">
      <span class="wordmark">capstone.</span>
      <div class="story-art"><CampusIllustration /></div>
      <div class="story-copy"><h1>Dari ide,<br>menjadi karya.</h1></div>
    </section>
    <section class="login-panel" aria-labelledby="login-heading">
      <div class="login-content"><h2 id="login-heading">Selamat datang.</h2><p class="login-subtitle">Gunakan akun yang disiapkan oleh admin.</p><p v-if="route.query.changed === '1'" class="notice success password-changed" role="status">Kata sandi berhasil diubah. Silakan masuk kembali.</p><LoginForm :busy="busy" :error="error" @submit="submit" /></div>
    </section>
  </main>
</template>

<style scoped>
.login-page { display: grid; grid-template-columns: 7fr 3fr; min-height: 100dvh; background: var(--canvas); color: var(--ink); }
.story-panel { position: relative; display: flex; flex-direction: column; background: var(--sage); padding: 2.5rem 3.25rem; color: #263f33; min-width: 0; }
.wordmark { font-size: 2rem; font-weight: 650; letter-spacing: -.07em; }
.story-art { width: 92%; margin: 1rem auto 0; flex: 1; display: flex; align-items: center; justify-content: center; }
.story-copy { position: relative; }
.story-copy h1 { font-size: clamp(2.5rem,4.1vw,4rem); line-height: 1.05; font-weight: 500; letter-spacing: -.045em; }
.login-panel { padding: 2.5rem clamp(1.5rem,2.5vw,3rem); display: flex; min-width: 0; }
.login-content { width: 100%; max-width: 340px; margin: auto; padding: 2rem 0; }
.login-content h2 { font-size: clamp(1.75rem,2.3vw,2.25rem); letter-spacing: -.04em; font-weight: 600; line-height: 1.2; }
.login-subtitle { margin-top: 1rem; font-size: 1rem; color: var(--muted); line-height: 1.6; }
.password-changed { margin-top: 1rem; }
@media(min-width:1600px) { .story-art { max-height: 620px; } }
@media(min-width:768px) and (max-width:1199px) { .login-page { grid-template-columns: 55fr 45fr; } .story-panel { padding: 2rem; } .story-art { width: 100%; } }
@media(max-width:767px) { .login-page { display: block; } .story-panel { padding: 1.25rem 1.5rem; min-height: 215px; overflow: hidden; } .wordmark { z-index: 1; font-size: 1.75rem; } .story-art { position: absolute; width: 250px; right: -35px; bottom: 0; margin: 0; } .story-copy { padding: 1.5rem 0 0; z-index: 1; max-width: 60%; } .story-copy h1 { font-size: 2rem; } .login-panel { padding: 1.5rem; min-height: calc(100dvh - 215px); } .login-content { padding: 1.5rem 0; max-width: 400px; } }
</style>
