<script setup lang="ts">
import { labels } from '../types'
defineProps<{ value: string }>()
</script>
<template><span class="status-label" :class="value.toLowerCase()">{{ labels[value] || value }}</span></template>
<style scoped>
.status-label { display: inline-flex; color: var(--muted); font-size: .9375rem; font-weight: 600; white-space: nowrap; }
.approved,.finalized,.valid,.layak,.passed,.published,.active,.answered,.ready { color: var(--success); }
.revision,.rejected,.revisi,.ditolak,.failed,.insufficient_context { color: var(--error); }
.submitted,.pending,.scheduled,.registered,.indexed,.locked,.open { color: var(--info); }
</style>
