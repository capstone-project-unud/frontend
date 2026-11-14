<script setup lang="ts">
import WorkspaceSelect from './WorkspaceSelect.vue'
defineProps<{ id: string; label: string; options: { value: string; label: string }[]; disabled?: boolean }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="workspace-filter">
    <WorkspaceSelect :id="id" v-model="model" :label="label" :options="options" :disabled="disabled" />
  </div>
</template>
