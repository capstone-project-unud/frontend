<script setup lang="ts">
defineProps<{ busy: boolean }>()
const emit = defineEmits<{ reset: [password: string] }>()
const open = shallowRef(false)
const password = shallowRef('')
</script>
<template>
  <section class="password-reset"><h3>Akses akun</h3><p>Atur kata sandi baru jika pengguna kehilangan akses. Seluruh sesinya akan dicabut.</p><button v-if="!open" type="button" class="text-button" :disabled="busy" @click="open = true">Atur ulang kata sandi</button><form v-else @submit.prevent="emit('reset', password)"><label for="reset-password">Kata sandi baru</label><input id="reset-password" v-model="password" type="password" autocomplete="new-password" minlength="12" maxlength="72" required :disabled="busy"><div><button type="button" class="button secondary" :disabled="busy" @click="open = false; password = ''">Batal</button><button type="submit" class="button primary" :disabled="busy">{{ busy ? 'Mengatur ulang…' : 'Simpan kata sandi baru' }}</button></div></form></section>
</template>
<style scoped>
.password-reset { padding: 1.5rem 2rem; border-top: 1px solid var(--line); }
h3 { font-size: 1rem; font-weight: 600; }
p { font-size: .8125rem; line-height: 1.6; color: var(--muted); margin: .5rem 0 1rem; }
label { font-size: .8125rem; display: block; margin-bottom: .5rem; }
form > div { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .75rem; margin-top: 1rem; }
@media(max-width:767px) { .password-reset { padding: 1.25rem; } }
</style>
