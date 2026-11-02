<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import AppSidebar from '~/components/workspace/AppSidebar.vue'
import { apiMessage } from '~/utils/format'
const auth = useAuth()
const isAdmin = computed(() => auth.user.value?.roles.includes('ADMIN'))
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
  <div class="workspace" :class="{ 'sidebar-minimized': collapsed }">
    <a href="#main-content" class="skip-link">Langsung ke konten</a>
    <AppSidebar :collapsed="collapsed" :is-admin="!!isAdmin" :full-name="auth.user.value?.full_name || ''" :busy="leaving" @toggle="collapsed = !collapsed" @logout="logout" />
    <main id="main-content" class="main-content"><p v-if="logoutError" role="alert" class="notice error logout-error">{{ logoutError }}</p><slot /></main>
  </div>
</template>

<style scoped>
.workspace { --sidebar-width: 16.5rem; display: grid; grid-template-columns: var(--sidebar-width) minmax(0,1fr); gap: 1.5rem; padding: 1rem; min-height: 100dvh; transition: grid-template-columns 180ms ease; }
.workspace.sidebar-minimized { --sidebar-width: 5.5rem; }
.main-content { min-width: 0; padding: 1.5rem 1.5rem 2rem .5rem; }
.logout-error { margin-bottom: 1.5rem; }
@media(min-width:768px) and (max-width:1199px) { .workspace { --sidebar-width: 15.5rem; gap: 1rem; } .main-content { padding: 1rem .5rem 1.5rem; } }
@media(max-width:767px) { .workspace,.workspace.sidebar-minimized { grid-template-columns: minmax(0,1fr); gap: 1rem; padding: .75rem; } .main-content { padding: .5rem .5rem 1.5rem; } }
</style>
