<script setup lang="ts">
import type { User } from '~/types/user'
import { initials, roleLabels } from '~/utils/format'

const props = defineProps<{
  users: User[]
  role?: string
  busy: boolean
}>()

defineEmits<{
  edit: [user: User]
  status: [user: User]
}>()

const isLecturerView = computed(() => props.role === 'DOSEN')
</script>

<template>
  <table class="user-table workspace-table">
    <caption class="visually-hidden">Daftar pengguna Capstone Project</caption>
    <thead>
      <tr>
        <th scope="col">
          {{ isLecturerView ? 'Nama Dosen & Kontak' : 'Nama pengguna' }}
        </th>
        <th scope="col">
          {{ isLecturerView ? 'NIP / NIDN' : 'Identitas akademik' }}
        </th>
        <th v-if="isLecturerView" scope="col">
          Bidang Keahlian
        </th>
        <th scope="col">Peran</th>
        <th scope="col">Status</th>
        <th scope="col" class="action-heading">Tindakan</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>
          <div class="user-identity">
            <span
              class="user-avatar"
              :class="{
                lecturer: user.roles.includes('DOSEN'),
                admin: user.roles.includes('ADMIN')
              }"
            >
              {{ initials(user.full_name) }}
            </span>
            <div>
              <strong>{{ user.full_name }}</strong>
              <span>{{ user.email }}</span>
              <span v-if="user.phone" class="user-phone">{{ user.phone }}</span>
            </div>
          </div>
        </td>

        <td class="academic">
          <template v-if="isLecturerView">
            <div class="id-stack">
              <span v-if="user.nip">NIP: <strong>{{ user.nip }}</strong></span>
              <span v-if="user.nidn">NIDN: <strong>{{ user.nidn }}</strong></span>
              <span v-if="!user.nip && !user.nidn" class="muted">—</span>
            </div>
          </template>
          <template v-else>
            <span v-if="user.nim">
              {{ user.nim }}
              <small>Angkatan {{ user.admission_year }}</small>
            </span>
            <span v-else-if="user.nip || user.nidn">
              {{ user.nip || user.nidn }}
              <small>{{ user.nip ? 'NIP' : 'NIDN' }}</small>
            </span>
            <span v-else class="muted">—</span>
          </template>
        </td>

        <td v-if="isLecturerView" class="expertise-cell">
          <span v-if="user.expertise" class="expertise-text">{{ user.expertise }}</span>
          <span v-else class="muted">—</span>
        </td>

        <td>
          <div class="roles">
            <span
              v-for="role in user.roles"
              :key="role"
              class="role"
              :class="{ coordinator: role === 'KOORDINATOR_TA' }"
            >
              {{ roleLabels[role] }}
            </span>
          </div>
        </td>

        <td>
          <span class="status" :class="{ inactive: !user.is_active }">
            {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </td>

        <td class="actions">
          <NuxtLink v-if="user.roles.includes('ADMIN')" class="text-button" to="/account">
            Profil saya
          </NuxtLink>
          <template v-else>
            <button
              class="text-button"
              :disabled="busy"
              :aria-label="`Ubah ${user.full_name}`"
              @click="$emit('edit', user)"
            >
              Ubah
            </button>
            <button
              class="text-button status-action"
              :disabled="busy"
              :aria-label="`${user.is_active ? 'Nonaktifkan' : 'Aktifkan'} ${user.full_name}`"
              @click="$emit('status', user)"
            >
              {{ user.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.user-identity {
  display: flex;
  align-items: center;
  gap: .75rem;
  min-width: 0;
}

.user-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--ink);
  font-weight: 600;
  font-size: .875rem;
}

.user-avatar.lecturer {
  color: var(--ink);
  border-color: var(--border);
}

.user-avatar.admin {
  color: var(--accent);
  border-color: var(--border);
}

.user-identity strong {
  font-weight: 600;
  display: block;
  overflow-wrap: anywhere;
  color: var(--ink);
}

.user-identity div {
  min-width: 0;
}

.user-identity div > span {
  display: block;
  color: var(--muted);
  font-size: .875rem;
  margin-top: .15rem;
  overflow-wrap: anywhere;
}

.user-phone {
  font-size: .8125rem !important;
  color: var(--muted);
}

.academic {
  overflow-wrap: anywhere;
  color: var(--ink);
}

.academic small {
  display: block;
  margin-top: .25rem;
  font-size: .875rem;
  color: var(--muted);
}

.id-stack {
  display: flex;
  flex-direction: column;
  gap: .2rem;
  font-size: .875rem;
}

.id-stack strong {
  font-weight: 600;
  color: var(--ink);
}

.expertise-cell {
  max-width: 240px;
  line-height: 1.45;
}

.expertise-text {
  font-size: .875rem;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.roles {
  display: flex;
  gap: .3rem;
  flex-wrap: wrap;
}

.role {
  font-size: .875rem;
  font-weight: 600;
  padding: .3rem .55rem;
  background: var(--btn-default-bg);
  border-radius: 6px;
  color: var(--ink);
  border: 1px solid var(--border);
}

.role.coordinator {
  border-color: var(--accent);
  color: var(--accent);
}

.status {
  display: inline-flex;
  color: var(--success);
  font-size: .9375rem;
  font-weight: 600;
}

.status.inactive {
  color: var(--muted);
}

.actions {
  white-space: nowrap;
  text-align: right;
  padding-right: 1.5rem;
}

.actions .text-button {
  font-size: .9375rem;
  display: inline-flex;
  align-items: center;
  color: var(--accent);
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: .25rem .4rem;
}

.actions .text-button:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.status-action {
  color: var(--muted) !important;
}

.status-action:hover {
  color: var(--ink) !important;
}

.action-heading {
  text-align: right;
  padding-right: 1.5rem;
}

@container users (max-width: 900px) {
  .actions .text-button {
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
  }
}

@container users (max-width: 700px) {
  .user-table,
  .user-table tbody {
    display: block;
  }
  thead {
    display: none;
  }
  tbody tr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 1.25rem 1rem;
    gap: .75rem;
    border-top: 1px solid var(--line);
  }
  td,
  td:first-child {
    padding: 0;
    border: 0;
    min-width: 0;
  }
  td:first-child {
    grid-column: 1 / -1;
  }
  .academic {
    grid-column: 1 / -1;
  }
  .expertise-cell {
    grid-column: 1 / -1;
  }
  .actions {
    grid-column: 1 / -1;
    border-top: 1px solid var(--line);
    padding-top: .5rem;
    white-space: normal;
  }
  .actions .text-button {
    display: inline-flex;
  }
}
</style>
