<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import AppSidebar from '~/components/workspace/AppSidebar.vue'
import WorkspaceHeader from '~/components/workspace/WorkspaceHeader.vue'
import { apiMessage } from '~/utils/format'
const auth = useAuth()
const collapsed = useCookie<boolean>('capstone_sidebar_collapsed', { default: () => false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
const logoutError = shallowRef('')
const leaving = shallowRef(false)
async function logout() {
  leaving.value = true
  logoutError.value = ''
  try { await auth.logout() }
  catch (error) { logoutError.value = apiMessage(error) }
  finally { leaving.value = false }
}
</script>

<template>
  <div class="workspace-shell">
    <div class="workspace" :class="{ 'sidebar-minimized': collapsed }">
      <a href="#main-content" class="skip-link">Langsung ke konten</a>
      <AppSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
      <main id="main-content" class="main-content">
        <WorkspaceHeader :busy="leaving" @logout="logout" />
        <p v-if="logoutError" role="alert" class="notice error logout-error">{{ logoutError }}</p>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.workspace-shell { --shell-gutter: clamp(.5rem, 1.25vw, 1rem); --shell-top: max(var(--shell-gutter), env(safe-area-inset-top)); --shell-end: max(var(--shell-gutter), env(safe-area-inset-right)); --shell-bottom: max(var(--shell-gutter), env(safe-area-inset-bottom)); --shell-start: max(var(--shell-gutter), env(safe-area-inset-left)); container: workspace-shell / inline-size; width: 100%; min-height: 100dvh; }
.workspace { --sidebar-width: clamp(13rem, 19cqi, 16.5rem); display: grid; grid-template-columns: minmax(0,var(--sidebar-width)) minmax(0,1fr); gap: clamp(.75rem, 1.5cqi, 1.5rem); padding: var(--shell-top) var(--shell-end) var(--shell-bottom) var(--shell-start); min-height: 100dvh; transition: grid-template-columns 180ms ease; }
.workspace.sidebar-minimized { --sidebar-width: clamp(3.5rem, 5cqi, 5.5rem); }
.main-content { min-width: 0; container: main-content / inline-size; padding: 0 clamp(.5rem, 1.5cqi, 1.5rem) 2rem clamp(.25rem, .75cqi, .5rem); }
.logout-error { margin-bottom: clamp(.75rem, 1.5cqi, 1.5rem); }
@container workspace-shell (max-width: 54rem) {
  .workspace,.workspace.sidebar-minimized { grid-template-columns: minmax(0,1fr); gap: clamp(.75rem, 2cqi, 1rem); }
  .main-content { padding: clamp(.25rem, 1cqi, .5rem) clamp(.25rem, 1cqi, .5rem) 1.5rem; }
}
</style>
