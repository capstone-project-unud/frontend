<script setup lang="ts">
import type { DashboardMetric } from '../types'
import WorkspaceStatistics from '~/components/workspace/WorkspaceStatistics.vue'
defineProps<{ items: DashboardMetric[]; label: string }>()
</script>

<template>
  <WorkspaceStatistics :items="items" :label="label" />
</template>
