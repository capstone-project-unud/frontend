<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import { useTheme } from '~/composables/useTheme'
import { dashboardDefinitions } from '~/features/dashboard/composables/useDashboard'
import type { DashboardScope } from '~/features/dashboard/types'
import { initials } from '~/utils/format'
import WorkspaceIcon from './WorkspaceIcon.vue'

defineProps<{ busy: boolean }>()
defineEmits<{ logout: [] }>()

const auth = useAuth()
const { isDark, toggle } = useTheme()
const { isLoading: navLoading } = useLoadingIndicator()
const route = useRoute()
const pageMeta = computed(() => route.meta as typeof route.meta & { workspaceTitle?: string })
const dashboardScope = computed<DashboardScope | null>(() => {
  const roles = auth.user.value?.roles || []
  if (roles.includes('ADMIN')) return 'admin'
  if (roles.includes('KOORDINATOR_TA')) return 'coordinator'
  if (roles.includes('TU')) return 'tu'
  if (roles.includes('KOPRODI')) return 'koprodi'
  if (roles.includes('DOSEN')) return 'lecturer'
  if (roles.includes('MAHASISWA')) return 'student'
  return null
})
const isStudent = computed(() => auth.user.value?.roles.includes('MAHASISWA') ?? false)
const title = computed(() => {
  if (route.path === '/dashboard' && dashboardScope.value) return dashboardDefinitions[dashboardScope.value].title
  if (route.path === '/capstone' && isStudent.value) return 'Judul capstone saya'
  if (route.path === '/proposal' && isStudent.value) return 'Persyaratan ujian proposal'
  return pageMeta.value.workspaceTitle || 'Ruang kerja'
})
const profileMenu = ref<HTMLDetailsElement | null>(null)

function closeProfileMenu() {
  if (profileMenu.value) profileMenu.value.open = false
}

function closeProfileMenuAndFocus() {
  closeProfileMenu()
  profileMenu.value?.querySelector('summary')?.focus()
}
</script>

<template>
  <header class="workspace-topbar" :class="{ 'has-heading': !!title }">
    <div v-if="title" class="topbar-heading">
      <h1 id="workspace-page-title">{{ title }}</h1>
      <span v-if="navLoading" class="topbar-spinner" role="status" aria-label="Memuat halaman" title="Memuat halaman" />
    </div>
    <div class="topbar-actions">
      <button class="topbar-action theme-action" type="button" :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'" :title="isDark ? 'Mode terang' : 'Mode gelap'" @click="toggle">
        <WorkspaceIcon :name="isDark ? 'sun' : 'moon'" />
        <span>{{ isDark ? 'Mode terang' : 'Mode gelap' }}</span>
      </button>
      <details ref="profileMenu" class="profile-menu" @keydown.esc.prevent="closeProfileMenuAndFocus">
        <summary aria-label="Buka menu profil" title="Menu profil">
          <span class="profile-avatar" aria-hidden="true">{{ initials(auth.user.value?.full_name || '') }}</span>
          <span class="profile-name">{{ auth.user.value?.full_name || 'Profil saya' }}</span>
          <WorkspaceIcon name="chevron" />
        </summary>
        <div class="profile-popover">
          <div class="profile-identity">
            <strong>{{ auth.user.value?.full_name || 'Pengguna' }}</strong>
            <span>{{ auth.user.value?.email }}</span>
          </div>
          <NuxtLink class="profile-menu-item" to="/account" @click="closeProfileMenu">Profil saya</NuxtLink>
          <NuxtLink class="profile-menu-item" to="/account#password-settings" @click="closeProfileMenu">
            <WorkspaceIcon name="settings" />
            <span>Pengaturan akun</span>
          </NuxtLink>
          <button class="profile-menu-item" type="button" :disabled="busy" :aria-busy="busy" @click="$emit('logout'); closeProfileMenu()">
            <WorkspaceIcon name="logout" />
            <span>{{ busy ? 'Mengakhiri sesi…' : 'Keluar dari akun' }}</span>
          </button>
        </div>
      </details>
    </div>
  </header>
</template>

<style scoped>
.workspace-topbar { position: sticky; top: var(--shell-top, 1rem); z-index: 30; display: flex; align-items: center; justify-content: space-between; width: 100%; margin: 0 0 clamp(.75rem, 1.5cqi, 1.25rem); padding: clamp(.25rem, .75cqi, .5rem) clamp(.5rem, 1.25cqi, 1rem); gap: clamp(.5rem, 1.25cqi, 1rem); border: 1px solid var(--border); border-radius: clamp(.625rem, 1.2cqi, .875rem); background: var(--panel); box-shadow: var(--shadow-panel); }
.workspace-topbar.has-heading { min-width: 0; }
.topbar-heading { min-width: 0; display: flex; align-items: center; gap: .625rem; }
.topbar-spinner { width: 1.05rem; height: 1.05rem; border-radius: 50%; border: 2px solid var(--line); border-top-color: var(--accent); animation: topbar-spin .65s linear infinite; flex-shrink: 0; }
@keyframes topbar-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .topbar-spinner { animation: none; } }
.topbar-heading h1 { font-size: clamp(1.125rem, 1.9cqi, 1.625rem); font-weight: 600; letter-spacing: -.035em; line-height: 1.15; overflow-wrap: anywhere; }
.topbar-actions { display: flex; align-items: center; gap: clamp(.25rem, .6cqi, .375rem); flex: 0 0 auto; }
.topbar-action,.profile-menu summary { display: inline-flex; align-items: center; justify-content: center; gap: .5em; min-width: 2.75rem; min-height: 2.75rem; padding: .35em .625em; border: 1px solid var(--border); border-radius: .625rem; background: var(--panel); color: var(--ink); font-size: clamp(.8125rem, 1cqi, .875rem); font-weight: 600; cursor: pointer; transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
.topbar-action:hover,.profile-menu summary:hover,.profile-menu[open] summary { background: var(--panel-hover); border-color: var(--border-hover); }
.topbar-action :deep(.workspace-icon),.profile-menu summary :deep(.workspace-icon) { width: 1.15em; height: 1.15em; flex-basis: 1.15em; color: var(--muted); }
.profile-menu { position: relative; }
.profile-menu summary { list-style: none; }
.profile-menu summary::-webkit-details-marker { display: none; }
.profile-avatar { display: grid; place-items: center; width: 1.875rem; aspect-ratio: 1; flex: 0 0 auto; border: 1px solid var(--border); border-radius: 50%; color: var(--accent); background: var(--panel); font-size: .8125rem; font-weight: 700; }
.profile-name { max-width: clamp(6rem, 15cqi, 11rem); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-menu[open] summary :deep(.workspace-icon) { transform: rotate(180deg); }
.profile-popover { position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40; display: grid; gap: .375rem; width: min(19rem, calc(100cqi - 1rem)); padding: .5rem; border: 1px solid var(--border); border-radius: .875rem; background: var(--panel); color: var(--ink); box-shadow: 0 12px 32px rgba(0,0,0,.16); }
.profile-identity { display: grid; gap: .125rem; min-width: 0; padding: .5rem .625rem .75rem; border-bottom: 1px solid var(--line); }
.profile-identity strong,.profile-identity span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-identity strong { font-size: .875rem; font-weight: 650; }
.profile-identity span { color: var(--muted); font-size: .8125rem; }
.profile-menu-item { display: flex; align-items: center; gap: .625rem; min-block-size: 2.75rem; padding: .5rem .625rem; border: 1px solid var(--border); border-radius: 9px; background: var(--panel); color: var(--ink); text-align: left; font-size: .875rem; font-weight: 550; }
.profile-menu-item:hover:not(:disabled) { border-color: var(--border-hover); background: var(--panel-hover); }
.profile-menu-item :deep(.workspace-icon) { width: 1.125em; height: 1.125em; flex-basis: 1.125em; color: var(--muted); }
@container main-content (max-width: 42rem) {
 .profile-name,.theme-action span { display: none; }
 .profile-menu summary,.theme-action { padding-inline: .375rem; }
 .workspace-topbar.has-heading { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; }
 .topbar-heading { align-self: center; }
 .topbar-heading h1 { font-size: clamp(1.125rem, 3.5cqi, 1.375rem); }
}
@container main-content (max-width: 28rem) {
 .workspace-topbar.has-heading { grid-template-columns: minmax(0,1fr); }
 .topbar-actions { justify-self: end; }
}
</style>
