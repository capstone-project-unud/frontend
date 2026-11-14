<script setup lang="ts">
import { labels } from '../types'
defineProps<{ value: string }>()
</script>
<template><span class="status-label" :class="value.toLowerCase()">{{ labels[value] || value }}</span></template>
<style scoped>
.status-label { display: inline-flex; color: var(--muted); font-size: .9375rem; font-weight: 600; white-space: nowrap; }
.approved,.finalized,.valid { color: var(--success); }.revision,.rejected { color: var(--error); }.submitted,.pending { color: var(--muted); }
</style>
