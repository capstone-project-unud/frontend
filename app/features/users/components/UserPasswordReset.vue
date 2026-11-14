<script setup lang="ts">
defineProps<{ busy: boolean }>()
const emit = defineEmits<{ reset: [password: string] }>()
const open = shallowRef(false)
const password = shallowRef('')
</script>

<template>
  <section class="password-reset">
    <div class="reset-header">
      <div>
        <h3>Akses & Keamanan Akun</h3>
        <p>Atur kata sandi baru jika pengguna kehilangan akses. Seluruh sesi aktif akan dicabut.</p>
      </div>
      <button v-if="!open" type="button" class="text-button trigger-btn" :disabled="busy" @click="open = true">
        Atur ulang kata sandi
      </button>
    </div>

    <form v-if="open" class="reset-form" @submit.prevent="emit('reset', password)">
      <div class="field">
        <label for="reset-password">Kata sandi baru</label>
        <input
          id="reset-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          minlength="12"
          maxlength="72"
          placeholder="Minimal 12 karakter"
          required
          :disabled="busy"
        >
      </div>
      <div class="reset-actions">
        <button type="button" class="button secondary" :disabled="busy" @click="open = false; password = ''">
          Batal
        </button>
        <button type="submit" class="button primary" :disabled="busy">
          {{ busy ? 'Mengatur ulang…' : 'Simpan kata sandi baru' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.password-reset {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--line);
  background: var(--canvas);
}

.reset-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

h3 {
  font-size: .9375rem;
  font-weight: 700;
  color: var(--ink);
}

p {
  font-size: .875rem;
  line-height: 1.5;
  color: var(--muted);
  margin-top: .25rem;
}

.trigger-btn {
  white-space: nowrap;
  font-size: .875rem;
}

.reset-form {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--line);
}

.reset-actions {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  margin-top: 1rem;
}

@media (max-width: 767px) {
  .password-reset { padding: 1.25rem; }
  .reset-header { flex-direction: column; }
}
</style>
