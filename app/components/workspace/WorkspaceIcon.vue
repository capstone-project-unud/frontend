<script setup lang="ts">
defineProps<{ name: 'users' | 'activity' | 'profile' | 'collapse' | 'expand' | 'logout' }>()
const paths = {
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  activity: 'M4 6h16M4 12h11M4 18h14',
  profile: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  collapse: 'M9 4v16M15 9l-3 3 3 3M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1',
  expand: 'M9 4v16M13 9l3 3-3 3M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M10 12h11M17 8l4 4-4 4',
}
</script>

<template>
  <svg class="workspace-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="paths[name]" /></svg>
</template>

<style scoped>
.workspace-icon { display: block; width: 22px; height: 22px; flex: 0 0 22px; }
</style>
