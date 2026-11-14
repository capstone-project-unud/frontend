<script setup lang="ts">
defineProps<{ items: { label: string; value: number | string | null | undefined }[]; label: string }>()
const numbers = new Intl.NumberFormat('id-ID')
</script>

<template>
  <dl class="workspace-statistics" :aria-label="label">
    <div v-for="item in items" :key="item.label" class="workspace-stat">
      <dt>{{ item.label }}</dt>
      <dd>{{ typeof item.value === 'number' ? numbers.format(item.value) : item.value ?? '—' }}</dd>
    </div>
  </dl>
</template>
