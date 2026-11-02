<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import { initials, apiMessage } from '~/utils/format'
const auth = useAuth()
const isAdmin = computed(() => auth.user.value?.roles.includes('ADMIN'))
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
  <div class="workspace">
    <a href="#main-content" class="skip-link">Langsung ke konten</a>
    <aside class="sidebar">
      <NuxtLink :to="isAdmin ? '/admin/users' : '/account'" class="brand">capstone.<span>PSTI Universitas Udayana</span></NuxtLink>
      <div class="workspace-label">Ruang kerja {{ isAdmin ? 'admin' : 'akademik' }}</div>
      <nav class="navigation" aria-label="Navigasi utama">
        <NuxtLink v-if="isAdmin" to="/admin/users"><span aria-hidden="true" class="nav-symbol">▦</span>Manajemen pengguna</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin/activity"><span aria-hidden="true" class="nav-symbol">≋</span>Aktivitas</NuxtLink>
        <NuxtLink to="/account"><span aria-hidden="true" class="nav-symbol">◉</span>Profil saya</NuxtLink>
      </nav>
      <div class="sidebar-bottom"><div class="scope-note"><span class="scope-line" />Sistem Layanan<br>Capstone Project</div><div class="current-user"><span class="avatar">{{ initials(auth.user.value?.full_name || '') }}</span><div><strong>{{ auth.user.value?.full_name }}</strong><small>{{ isAdmin ? 'Administrator' : 'Pengguna' }}</small></div></div><button class="logout-button" :disabled="leaving" @click="logout">{{ leaving ? 'Mengakhiri sesi…' : 'Keluar dari akun' }}<span aria-hidden="true">↗</span></button></div>
    </aside>
    <div class="workspace-main"><header class="topbar"><span>Sistem Layanan Capstone Project</span><span class="context-label">{{ isAdmin ? 'Administrasi' : 'Akun saya' }} <span aria-hidden="true">/</span> PSTI Unud</span></header><main id="main-content" class="main-content"><p v-if="logoutError" role="alert" class="notice error">{{ logoutError }}</p><slot /></main><footer class="workspace-footer">Program Studi Teknologi Informasi<span>Universitas Udayana</span></footer></div>
  </div>
</template>

<style scoped>
.workspace { display: grid; grid-template-columns: 224px minmax(0,1fr); min-height: 100dvh; }
.sidebar { background: #eeefec; border-right: 1px solid #e1e2dd; padding: 2rem 1.125rem 1rem; display: flex; flex-direction: column; position: sticky; top: 0; height: 100dvh; }
.brand { font-size: 2rem; font-weight: 650; letter-spacing: -.07em; padding: 0 .75rem; }
.brand span { display: block; font-size: .6875rem; font-weight: 450; letter-spacing: 0; margin-top: .375rem; color: var(--muted); }
.workspace-label { margin: 3rem .75rem 1rem; color: var(--muted); font-size: .6875rem; }
.navigation { display: flex; flex-direction: column; gap: .5rem; }
.navigation a { display: flex; align-items: center; gap: .7rem; padding: .8rem .75rem; min-height: 46px; font-size: .8125rem; border-radius: 10px; color: #575761; font-weight: 500; }
.navigation a:hover { background: #e5e6e1; }
.navigation a.router-link-active { background: white; color: var(--accent); }
.nav-symbol { font-size: 1.125rem; width: 20px; text-align: center; }
.sidebar-bottom { margin-top: auto; }
.scope-note { padding: 1.25rem .75rem; font-size: .75rem; line-height: 1.6; color: var(--muted); }
.scope-line { display: block; width: 28px; height: 3px; background: #8da991; margin-bottom: .875rem; }
.current-user { display: flex; gap: .625rem; padding: 1rem .5rem; border-top: 1px solid #d5d8d0; }
.avatar { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; background: #d7dfd4; color: #354c3b; border-radius: 50%; font-weight: 600; font-size: .75rem; }
.current-user strong { font-size: .75rem; line-height: 1.4; display: block; overflow-wrap: anywhere; }
.current-user small { display: block; font-size: .6875rem; color: var(--muted); margin-top: .25rem; }
.logout-button { display: flex; justify-content: space-between; width: 100%; min-height: 44px; padding: .6rem .75rem; border: 0; background: transparent; color: var(--muted); font-size: .75rem; }
.logout-button:hover { background: #e3e5df; border-radius: 8px; }
.workspace-main { min-width: 0; display: flex; flex-direction: column; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; height: 70px; padding: 0 2.5rem; border-bottom: 1px solid var(--line); font-size: .75rem; color: var(--muted); }
.context-label { display: flex; gap: 1rem; }
.main-content { padding: 2rem 2.5rem 3rem; flex: 1; }
.workspace-footer { display: flex; justify-content: space-between; gap: 1rem; padding: 1.25rem 2.5rem; color: var(--muted); font-size: .6875rem; border-top: 1px solid var(--line); }
@media(min-width:768px) and (max-width:1199px) { .workspace { grid-template-columns: 190px minmax(0,1fr); } .sidebar { padding-inline: .75rem; } .navigation a { font-size: .75rem; gap: .4rem; } .topbar,.main-content,.workspace-footer { padding-inline: 1.5rem; } }
@media(max-width:767px) { .workspace { display: block; } .sidebar { height: auto; position: static; padding: 1rem 1.25rem 0; border-right: 0; border-bottom: 1px solid #d5d8d0; } .brand { font-size: 1.6rem; padding: 0; } .brand span { display: inline; margin-left: 1rem; font-size: .625rem; } .workspace-label,.scope-note,.current-user,.sidebar-bottom { display: none; } .navigation { flex-direction: row; margin-top: 1rem; gap: .5rem; flex-wrap: wrap; } .navigation a { padding: .7rem .625rem; font-size: .75rem; border-radius: 8px 8px 0 0; } .nav-symbol { display: none; } .topbar { height: 50px; padding: 0 1.25rem; font-size: .6875rem; } .topbar > span:first-child { display: none; } .main-content { padding: 1.5rem 1.25rem 2rem; } .workspace-footer { padding: 1.25rem; flex-wrap: wrap; } }
</style>
