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
    <button class="button primary login-submit" :disabled="busy" type="submit">{{ busy ? 'Sedang masuk…' : 'Masuk' }}</button>
    <details class="login-help">
      <summary>Butuh bantuan masuk?</summary>
      <p>Hubungi admin program studi untuk mendapatkan akun, mengaktifkan akun, atau meminta pengaturan ulang kata sandi.</p>
    </details>
  </form>
</template>

<style scoped>
.login-form { margin-top: 2rem; }
.line-field { display: flex; flex-direction: column; gap: .75rem; }
.line-field + .line-field { margin-top: 1.5rem; }
.line-field label { font-size: .9375rem; font-weight: 600; }
.line-field input { min-height: 52px; padding: .75rem; border-radius: 10px; }
.password-input { display: flex; border: 1px solid #85858d; border-radius: 10px; align-items: center; min-width: 0; }
.password-input:focus-within { outline: 2px solid var(--accent); outline-offset: -2px; border-color: var(--accent); }
.password-input input { border: 0; min-width: 0; background: transparent; }
.password-input input:focus-visible { outline: none; }
.reveal { padding: .5rem .75rem; font-size: .875rem; font-weight: 600; min-height: 44px; color: var(--accent); background: transparent; border: 0; border-radius: 8px; }
.reveal:focus-visible { outline-offset: -2px; }
.login-submit { width: 100%; min-height: 52px; margin-top: 2rem; }
.login-help { text-align: center; margin-top: 1.5rem; font-size: .9375rem; color: var(--muted); }
.login-help summary { cursor: pointer; min-height: 44px; padding: .75rem 0; }
.login-help p { line-height: 1.65; padding-top: .5rem; }
</style>
