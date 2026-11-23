<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'dashboard' | 'table' | 'cards' | 'detail' | 'spinner'
  rows?: number
  label?: string
}>(), {
  variant: 'cards',
  rows: 4,
  label: 'Memuat data…',
})
</script>

<template>
  <div class="sk-root" role="status" aria-busy="true" :aria-label="props.label">
    <template v-if="props.variant === 'spinner'">
      <div class="sk-spinner-box">
        <span class="sk-spinner" aria-hidden="true" />
        <span class="sk-spinner-text">{{ props.label }}</span>
      </div>
    </template>

    <template v-else-if="props.variant === 'dashboard'">
      <div class="panel sk-panel">
        <div class="sk-stats-grid">
          <div v-for="n in 4" :key="n" class="sk-stat-col">
            <div class="sk-bar sk-w-45 sk-sm" />
            <div class="sk-bar sk-w-30 sk-lg" />
          </div>
        </div>
      </div>
      <div class="sk-grid-2">
        <div v-for="n in 2" :key="n" class="panel sk-panel sk-card">
          <div class="sk-bar sk-w-55 sk-md" />
          <div class="sk-bar sk-w-80 sk-sm" />
          <div class="sk-block" />
        </div>
      </div>
    </template>

    <template v-else-if="props.variant === 'table'">
      <div class="sk-table-list">
        <div class="sk-table-head">
          <div class="sk-bar sk-w-30 sk-sm" />
          <div class="sk-bar sk-w-75 sk-sm" />
          <div class="sk-bar sk-w-75 sk-sm" />
        </div>
        <div v-for="n in props.rows" :key="n" class="sk-table-row">
          <div class="sk-row-main">
            <div class="sk-bar sk-w-65 sk-md" />
            <div class="sk-bar sk-w-45 sk-sm" />
          </div>
          <div class="sk-bar sk-pill" />
          <div class="sk-bar sk-pill" />
        </div>
      </div>
    </template>

    <template v-else-if="props.variant === 'detail'">
      <div class="panel sk-panel sk-card">
        <div class="sk-card-top">
          <div class="sk-bar sk-w-60 sk-lg" />
          <div class="sk-bar sk-w-15 sk-pill" />
        </div>
        <div class="sk-bar sk-w-40 sk-sm" />
        <div class="sk-bar sk-w-95 sk-sm" />
        <div class="sk-bar sk-w-85 sk-sm" />
        <div class="sk-table-row">
          <div class="sk-bar sk-w-45 sk-sm" />
          <div class="sk-bar sk-w-25 sk-sm" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="sk-cards-list">
        <div v-for="n in Math.min(props.rows, 4)" :key="n" class="sk-card-item">
          <div class="sk-card-top">
            <div class="sk-bar sk-w-55 sk-md" />
            <div class="sk-bar sk-w-15 sk-pill" />
          </div>
          <div class="sk-bar sk-w-75 sk-sm" />
          <div class="sk-bar sk-w-50 sk-sm" />
          <div class="sk-card-actions">
            <div class="sk-bar sk-w-20 sk-btn" />
            <div class="sk-bar sk-w-15 sk-btn" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sk-root { display: grid; gap: 1rem; width: 100%; }
.sk-panel { padding: 1.5rem; }
.sk-card { display: grid; gap: .875rem; }
.sk-bar, .sk-block {
  border-radius: 8px;
  background: linear-gradient(90deg, var(--line) 25%, color-mix(in srgb, var(--panel-hover) 85%, var(--canvas)) 50%, var(--line) 75%);
  background-size: 220% 100%;
  animation: sk-shimmer 1.35s ease-in-out infinite;
}
.sk-sm { height: .75rem; }
.sk-md { height: 1rem; }
.sk-lg { height: 1.5rem; }
.sk-pill { height: 1.5rem; border-radius: 999px; }
.sk-btn { height: 2.25rem; border-radius: 10px; }
.sk-block { height: 7.5rem; border-radius: 12px; }
.sk-w-15 { width: 15%; min-width: 4.5rem; }
.sk-w-20 { width: 20%; min-width: 5.5rem; }
.sk-w-25 { width: 25%; }
.sk-w-30 { width: 30%; }
.sk-w-40 { width: 40%; }
.sk-w-45 { width: 45%; }
.sk-w-50 { width: 50%; }
.sk-w-55 { width: 55%; }
.sk-w-60 { width: 60%; }
.sk-w-65 { width: 65%; }
.sk-w-75 { width: 75%; }
.sk-w-80 { width: 80%; }
.sk-w-85 { width: 85%; }
.sk-w-95 { width: 95%; }
.sk-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.sk-stat-col { display: grid; gap: .625rem; padding-left: 1rem; border-left: 1px solid var(--line); }
.sk-stat-col:first-child { padding-left: 0; border-left: 0; }
.sk-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.sk-table-list { border-top: 1px solid var(--line); }
.sk-table-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(5.5rem, 18%) minmax(4.5rem, 14%); align-items: center; gap: 1rem; padding: .875rem 1.5rem; background: var(--canvas); border-bottom: 1px solid var(--line); }
.sk-table-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.5rem; border-bottom: 1px solid var(--line); }
.sk-table-list .sk-table-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(5.5rem, 18%) minmax(4.5rem, 14%); }
.sk-table-row:last-child { border-bottom: 0; }
.sk-row-main { flex: 1; display: grid; gap: .5rem; min-width: 0; }
.sk-cards-list { display: grid; border-top: 1px solid var(--line); }
.sk-card-item { display: grid; gap: .75rem; padding: 1.5rem; border-top: 1px solid var(--line); }
.sk-card-item:first-child { border-top: 0; }
.sk-card-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.sk-card-actions { display: flex; gap: .625rem; margin-top: .25rem; }
.sk-spinner-box { display: flex; align-items: center; justify-content: center; gap: .75rem; padding: 2.5rem 1.5rem; color: var(--muted); font-size: .9375rem; font-weight: 500; }
.sk-spinner { width: 1.35rem; height: 1.35rem; border-radius: 50%; border: 2.5px solid var(--line); border-top-color: var(--accent); animation: sk-spin .7s linear infinite; flex-shrink: 0; }

@keyframes sk-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -120% 0; }
}
@keyframes sk-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .sk-bar, .sk-block { animation: none; background: var(--line); }
  .sk-spinner { animation: none; }
}
@container main-content (max-width: 720px) {
  .sk-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sk-stat-col:nth-child(odd) { padding-left: 0; border-left: 0; }
  .sk-grid-2 { grid-template-columns: minmax(0, 1fr); }
}
</style>
