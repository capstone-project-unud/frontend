<script setup lang="ts">
defineProps<{ name: 'users' | 'activity' | 'profile' | 'collapse' | 'expand' | 'logout' | 'sun' | 'moon' | 'projects' | 'sheet' | 'book' | 'document' | 'settings' | 'chevron' | 'group' | 'award' | 'chat' | 'chart' }>()
const paths = {
  projects: 'M4 5h16v15H4zM8 3v4M16 3v4M8 11h8M8 15h5',
  sheet: 'M3 4h18v16H3zM3 9h18M9 4v16M15 4v16M3 14h18',
  book: 'M12 6v15M12 6C8 3 4 4 2 5v14c3-1 6-1 10 2M12 6c4-3 8-2 10-1v14c-3-1-6-1-10 2',
  document: 'M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 17h6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  group: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M19 8v4M21 10h-4',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.21 13.89 7 22l5-3 5 3-1.21-8.12',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  chart: 'M4 19h16M7 16v-5M12 16V7M17 16v-8',
  activity: 'M4 6h16M4 12h11M4 18h14',
  profile: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  collapse: 'M9 4v16M15 9l-3 3 3 3M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1',
  expand: 'M9 4v16M13 9l3 3-3 3M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M10 12h11M17 8l4 4-4 4',
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.75.46l-.06.06h-3.4l-.04-.08a1.7 1.7 0 0 0-1.5-1.03 1.7 1.7 0 0 0-.83.19l-.08.04-2.94-1.7.02-.08a1.7 1.7 0 0 0-.46-1.75l-.06-.06v-3.4l.08-.04a1.7 1.7 0 0 0 1.03-1.5 1.7 1.7 0 0 0-.19-.83l-.04-.08 1.7-2.94.08.02a1.7 1.7 0 0 0 1.75-.46l.06-.06h3.4l.04.08a1.7 1.7 0 0 0 1.5 1.03c.29 0 .58-.07.83-.19l.08-.04 2.94 1.7-.02.08a1.7 1.7 0 0 0 .46 1.75l.06.06v3.4l-.08.04a1.7 1.7 0 0 0-1.03 1.5c0 .29.07.58.19.83z',
  chevron: 'm7 10 5 5 5-5',
}
</script>

<template>
  <svg class="workspace-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="paths[name]" /></svg>
</template>

<style scoped>
.workspace-icon { display: block; width: 22px; height: 22px; flex: 0 0 22px; }
</style>
