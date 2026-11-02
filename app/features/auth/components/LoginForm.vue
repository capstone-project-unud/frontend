<script setup lang="ts">
defineProps<{ busy: boolean; error: string }>()
const emit = defineEmits<{ submit: [email: string, password: string] }>()
const email = shallowRef('')
const password = shallowRef('')
const visible = shallowRef(false)
</script>

<template>
  <form class="login-form" @submit.prevent="emit('submit', email, password)">
    <div class="line-field">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" autocomplete="username" placeholder="nama@unud.ac.id" required maxlength="254" :disabled="busy">
    </div>
    <div class="line-field password-field">
      <label for="password">Kata sandi</label>
      <div class="password-input">
        <input id="password" v-model="password" :type="visible ? 'text' : 'password'" autocomplete="current-password" placeholder="Masukkan kata sandi" required :disabled="busy">
        <button type="button" class="reveal" :aria-pressed="visible" :disabled="busy" @click="visible = !visible">{{ visible ? 'Sembunyikan' : 'Lihat' }}</button>
      </div>
    </div>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <button class="button primary login-submit" :disabled="busy" type="submit">{{ busy ? 'Sedang masuk…' : 'Masuk' }}<span aria-hidden="true">↗</span></button>
    <details class="login-help">
      <summary>Butuh bantuan masuk?</summary>
      <p>Hubungi admin program studi untuk mendapatkan akun, mengaktifkan akun, atau meminta pengaturan ulang kata sandi.</p>
    </details>
  </form>
</template>

<style scoped>
.login-form { margin-top: 2.5rem; }
.line-field + .line-field { margin-top: 1.5rem; }
.line-field label { display: block; font-size: .8125rem; color: var(--muted); font-weight: 500; }
.line-field input { border: 0; border-bottom: 1px solid #85858d; border-radius: 0; padding: .625rem 0; height: 3rem; background: transparent; }
.password-input { display: flex; border-bottom: 1px solid #85858d; align-items: center; }
.password-input input { border: 0; min-width: 0; }
.reveal { padding: .5rem; font-size: .75rem; min-height: 44px; color: var(--muted); background: transparent; border: 0; }
.login-submit { width: 100%; margin-top: 2rem; display: flex; justify-content: space-between; }
.login-submit span { font-size: 1.25rem; }
.login-help { text-align: center; margin-top: 1.5rem; font-size: .8125rem; color: var(--muted); }
.login-help summary { cursor: pointer; padding: .75rem 0; }
.login-help p { line-height: 1.65; padding-top: .5rem; }
</style>
