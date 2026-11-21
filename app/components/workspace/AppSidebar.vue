<script setup lang="ts">
import WorkspaceIcon from './WorkspaceIcon.vue'
import { useAuth } from '~/features/auth/composables/useAuth'

const props = defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

const auth = useAuth()
const route = useRoute()
const nuxtApp = useNuxtApp()
const displayedRoutePath = ref(route.path)
const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: 'activity', roles: [] },
  { to: '/groups', label: 'Kelompok', icon: 'group', roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'ADMIN'] },
  { to: '/capstone', label: 'Topik & Judul', icon: 'projects', roles: [] },
  { to: '/finalization', label: 'Finalisasi Judul', icon: 'sheet', roles: ['KOORDINATOR_TA'] },
  { to: '/guidance', label: 'Log Bimbingan', icon: 'book', roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'ADMIN'] },
  { to: '/proposal', label: 'Pendaftaran Proposal', icon: 'document', roles: ['MAHASISWA', 'DOSEN', 'TU', 'KOORDINATOR_TA', 'ADMIN', 'KOPRODI'] },
  { to: '/documents', label: 'Dokumen Capstone', icon: 'book', roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN'] },
  { to: '/sempro', label: 'Ujian Proposal', icon: 'sheet', roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN', 'KOPRODI'] },
  { to: '/final-exam', label: 'Ujian Akhir', icon: 'award', roles: ['MAHASISWA', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'ADMIN'] },
  { to: '/expo', label: 'Capstone Expo', icon: 'projects', roles: [] },
  { to: '/assistant', label: 'Asisten Pedoman', icon: 'chat', roles: [] },
  { to: '/reports', label: 'Monitoring & Laporan', icon: 'chart', roles: ['ADMIN', 'KOORDINATOR_TA', 'TU', 'KOPRODI'] },
  { to: '/admin/master', label: 'Data Master', icon: 'settings', roles: ['ADMIN', 'KOORDINATOR_TA'] },
  { to: '/admin/users', label: 'Manajemen Pengguna', icon: 'users', roles: ['ADMIN'] },
] as const
const links = computed(() => navigation.filter(item => !item.roles.length || item.roles.some(role => auth.user.value?.roles.some(r => r === role))))
const toggleLabel = computed(() => props.collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar')
const navigationElement = ref<HTMLElement | null>(null)
const activeIndicatorStyle = ref<Record<string, string>>({})
const activeIndicatorVisible = ref(false)
const activeIndicatorReady = ref(false)
let navigationResizeObserver: ResizeObserver | undefined

function isDisplayedRoute(target: string) {
  return displayedRoutePath.value === target || displayedRoutePath.value.startsWith(`${target}/`)
}

function updateActiveIndicator() {
  const navigationNode = navigationElement.value
  const activeLink = navigationNode?.querySelector<HTMLAnchorElement>('.is-current')

  if (!navigationNode || !activeLink) {
    activeIndicatorVisible.value = false
    return
  }

  const navigationBounds = navigationNode.getBoundingClientRect()
  const activeBounds = activeLink.getBoundingClientRect()

  if (!activeBounds.width || !activeBounds.height) {
    activeIndicatorVisible.value = false
    return
  }

  activeIndicatorStyle.value = {
    '--active-x': `${activeBounds.left - navigationBounds.left}px`,
    '--active-y': `${activeBounds.top - navigationBounds.top}px`,
    '--active-width': `${activeBounds.width}px`,
    '--active-height': `${activeBounds.height}px`,
  }
  activeIndicatorVisible.value = true
}

watch(
  [() => displayedRoutePath.value, () => props.collapsed, () => links.value.length],
  async () => {
    await nextTick()
    updateActiveIndicator()
  },
)

nuxtApp.hook('page:finish', () => {
  displayedRoutePath.value = route.path
})

onMounted(async () => {
  await nextTick()
  updateActiveIndicator()
  if (navigationElement.value) {
    navigationResizeObserver = new ResizeObserver(updateActiveIndicator)
    navigationResizeObserver.observe(navigationElement.value)
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { activeIndicatorReady.value = true }))
})

onBeforeUnmount(() => navigationResizeObserver?.disconnect())
</script>

<template>
  <aside id="workspace-sidebar" class="sidebar" :class="{ 'is-collapsed': collapsed }" aria-label="Menu aplikasi">
    <div class="sidebar-header">
      <NuxtLink to="/dashboard" class="brand" aria-label="Capstone"><span v-if="collapsed" aria-hidden="true">c.</span><span v-else>capstone.</span></NuxtLink>
      <button type="button" class="sidebar-toggle" :aria-label="toggleLabel" :title="toggleLabel" :aria-expanded="!collapsed" aria-controls="workspace-navigation" @click="$emit('toggle')"><WorkspaceIcon :name="collapsed ? 'expand' : 'collapse'" /></button>
    </div>
    <nav id="workspace-navigation" ref="navigationElement" class="navigation" aria-label="Navigasi utama">
      <span v-if="activeIndicatorVisible" class="navigation-indicator" :class="{ 'is-ready': activeIndicatorReady }" :style="activeIndicatorStyle" aria-hidden="true" />
      <NuxtLink v-for="item in links" :key="item.to" :to="item.to" :class="{ 'is-current': isDisplayedRoute(item.to) }" :aria-label="item.label" :title="collapsed ? item.label : undefined"><WorkspaceIcon :name="item.icon" /><span v-if="!collapsed" class="navigation-label">{{ item.label }}</span></NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar { position: sticky; top: var(--shell-top, 1rem); display: flex; flex-direction: column; align-self: start; min-width: 0; height: calc(100dvh - var(--shell-top, 1rem) - var(--shell-bottom, 1rem)); padding: clamp(.75rem, 1.25cqi, 1rem) clamp(.5rem, 1cqi, .75rem); background: var(--panel); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-panel); overflow-y: auto; scrollbar-width: thin; transition: background-color 150ms ease, border-color 150ms ease; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .25rem .25rem 1.5rem; }
.brand { font-size: clamp(1.5rem, 2.6cqi, 1.875rem); font-weight: 650; letter-spacing: -.07em; line-height: 1.2; }
.sidebar-toggle { display: grid; place-items: center; inline-size: 2.75rem; block-size: 2.75rem; flex: 0 0 2.75rem; padding: 0; color: var(--muted); background: transparent; border: 0; }
.sidebar-toggle:hover { color: var(--ink); background: transparent; }
.navigation { position: relative; display: flex; flex-direction: column; gap: .5rem; padding: .25rem; isolation: isolate; }
.navigation-indicator { position: absolute; z-index: 0; top: 0; left: 0; width: var(--active-width); height: var(--active-height); border: 1px solid var(--action); border-radius: 10px; background: var(--action); opacity: 0; pointer-events: none; transform: translate3d(var(--active-x), var(--active-y), 0); }
.navigation-indicator.is-ready { opacity: 1; transition: transform 320ms cubic-bezier(.22, .8, .25, 1), width 240ms ease, height 240ms ease, opacity 120ms ease; }
.navigation a { position: relative; z-index: 1; display: flex; align-items: center; gap: .75rem; padding: .75rem .75rem; min-block-size: 2.875rem; color: var(--muted); font-size: .9375rem; font-weight: 550; border-radius: 10px; border: 1px solid transparent; transition: color 180ms ease, background-color 150ms ease, border-color 150ms ease; }
.navigation a:hover:not(.is-current) { color: var(--ink); background: var(--canvas); }
.navigation a.is-current { color: #fff; background: transparent; border-color: transparent; }
.navigation a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.navigation-label { overflow-wrap: anywhere; }
.is-collapsed .sidebar-header { flex-direction: column; padding-inline: 0; gap: 1rem; }
.is-collapsed .navigation { padding-inline: 0; }
.is-collapsed .navigation a { justify-content: center; padding-inline: 0; }
@container workspace-shell (max-width: 54rem) {
  .sidebar { position: static; height: auto; padding: clamp(.5rem, 2cqi, .75rem); overflow: visible; border-radius: 16px; }
  .sidebar-header,.is-collapsed .sidebar-header { flex-direction: row; padding: .125rem .25rem; }
  .brand { font-size: clamp(1.5rem, 4cqi, 1.75rem); }
  .navigation { flex-direction: row; flex-wrap: wrap; padding-top: clamp(.5rem, 2cqi, .875rem); gap: clamp(.25rem, 1cqi, .375rem); }
  .navigation a { padding: clamp(.5rem, 2cqi, .75rem); }
  .is-collapsed .navigation { display: none; }
}
</style>
