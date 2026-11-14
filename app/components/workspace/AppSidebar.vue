<script setup lang="ts">
import { initials } from '~/utils/format'
import { useTheme } from '~/composables/useTheme'
import WorkspaceIcon from './WorkspaceIcon.vue'

const props = defineProps<{ collapsed: boolean; isAdmin: boolean; fullName: string; busy: boolean }>()
defineEmits<{ toggle: []; logout: [] }>()

const { isDark, toggle } = useTheme()

const navigation = [
  { to: '/admin/users', label: 'Manajemen pengguna', icon: 'users' },
  { to: '/account', label: 'Profil saya', icon: 'profile' },
] as const
const links = computed(() => navigation.filter(item => props.isAdmin || item.to === '/account'))
const toggleLabel = computed(() => props.collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar')
</script>

<template>
  <aside id="workspace-sidebar" class="sidebar" :class="{ 'is-collapsed': collapsed }" aria-label="Menu aplikasi">
    <div class="sidebar-header">
      <NuxtLink :to="isAdmin ? '/admin/users' : '/account'" class="brand" aria-label="Capstone"><span v-if="collapsed" aria-hidden="true">c.</span><span v-else>capstone.</span></NuxtLink>
      <button type="button" class="sidebar-toggle" :aria-label="toggleLabel" :title="toggleLabel" :aria-expanded="!collapsed" aria-controls="workspace-navigation" @click="$emit('toggle')"><WorkspaceIcon :name="collapsed ? 'expand' : 'collapse'" /></button>
    </div>
    <nav id="workspace-navigation" class="navigation" aria-label="Navigasi utama">
      <NuxtLink v-for="item in links" :key="item.to" :to="item.to" :aria-label="item.label" :title="collapsed ? item.label : undefined"><WorkspaceIcon :name="item.icon" /><span v-if="!collapsed" class="navigation-label">{{ item.label }}</span></NuxtLink>
    </nav>
    <div class="sidebar-bottom">
      <div class="current-user" :title="collapsed ? fullName : undefined"><span class="avatar" aria-hidden="true">{{ initials(fullName) }}</span><strong v-if="!collapsed">{{ fullName }}</strong><span v-else class="visually-hidden">{{ fullName }}</span></div>
      <button type="button" class="theme-toggle-button" :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'" :title="collapsed ? (isDark ? 'Mode terang' : 'Mode gelap') : undefined" @click="toggle">
        <WorkspaceIcon :name="isDark ? 'sun' : 'moon'" />
        <span v-if="!collapsed">{{ isDark ? 'Mode terang' : 'Mode gelap' }}</span>
      </button>
      <button type="button" class="logout-button" :disabled="busy" :aria-busy="busy" aria-label="Keluar dari akun" :title="collapsed ? 'Keluar dari akun' : undefined" @click="$emit('logout')"><WorkspaceIcon name="logout" /><span v-if="!collapsed">{{ busy ? 'Mengakhiri sesi…' : 'Keluar dari akun' }}</span></button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { position: sticky; top: 1rem; display: flex; flex-direction: column; align-self: start; min-width: 0; height: calc(100dvh - 2rem); padding: 1rem .75rem; background: var(--panel); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-panel); overflow-y: auto; scrollbar-width: thin; transition: background-color 150ms ease, border-color 150ms ease; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .25rem .25rem 1.5rem; }
.brand { font-size: 1.875rem; font-weight: 650; letter-spacing: -.07em; line-height: 1.2; }
.sidebar-toggle { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; padding: 0; color: var(--muted); background: transparent; border: 0; }
.sidebar-toggle:hover { color: var(--ink); background: transparent; }
.navigation { display: flex; flex-direction: column; gap: .5rem; padding: .25rem; }
.navigation a { display: flex; align-items: center; gap: .75rem; padding: .875rem .75rem; min-height: 48px; color: var(--muted); font-size: .9375rem; font-weight: 550; border-radius: 10px; border: 1px solid transparent; }
.navigation a:hover { color: var(--ink); background: var(--canvas); }
.navigation a.router-link-active { color: var(--accent); background: var(--panel-hover); border-color: var(--border); }
.navigation-label { overflow-wrap: anywhere; }
.sidebar-bottom { margin-top: auto; padding: 1.5rem .25rem 0; display: flex; flex-direction: column; gap: .25rem; }
.current-user { display: flex; align-items: center; gap: .75rem; padding: 1rem .5rem; border-top: 1px solid var(--line); }
.avatar { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; background: var(--panel); border: 1px solid var(--border); color: var(--accent); border-radius: 50%; font-size: .875rem; font-weight: 600; }
.current-user strong { font-size: .875rem; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.theme-toggle-button,
.logout-button { display: flex; align-items: center; gap: .75rem; width: 100%; min-height: 48px; padding: .75rem; border: 0; border-radius: 10px; color: var(--muted); background: transparent; font-size: .9375rem; text-align: left; cursor: pointer; transition: background-color 150ms ease, color 150ms ease; }
.theme-toggle-button:hover,
.logout-button:hover { background: var(--canvas); color: var(--ink); }
.is-collapsed .sidebar-header { flex-direction: column; padding-inline: 0; gap: 1rem; }
.is-collapsed .navigation { padding-inline: 0; }
.is-collapsed .navigation a,
.is-collapsed .theme-toggle-button,
.is-collapsed .logout-button { justify-content: center; padding-inline: 0; }
.is-collapsed .current-user { justify-content: center; padding-inline: 0; }
@media(max-width:767px) {
  .sidebar { position: static; height: auto; padding: .75rem; overflow: visible; border-radius: 16px; }
  .sidebar-header,.is-collapsed .sidebar-header { flex-direction: row; padding: .125rem .25rem; }
  .brand { font-size: 1.75rem; }
  .navigation { flex-direction: row; flex-wrap: wrap; padding-top: .875rem; gap: .375rem; }
  .navigation a { padding: .75rem; }
  .sidebar-bottom { display: none; }
  .is-collapsed .navigation { display: none; }
}
</style>
