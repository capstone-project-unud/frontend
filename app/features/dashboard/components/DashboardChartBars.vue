<script setup lang="ts">
import type { ChartBarRow } from '../types'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  rows: (ChartBarRow & { color?: string })[]
  primaryLabel: string
  secondaryLabel?: string
  primaryColor?: string
  secondaryColor?: string
  layout?: 'horizontal' | 'vertical'
  emptyText?: string
  actionTo?: string
  actionLabel?: string
}>(), {
  subtitle: '',
  secondaryLabel: '',
  primaryColor: 'var(--accent)',
  secondaryColor: 'var(--success)',
  layout: 'horizontal',
  emptyText: 'Belum ada data untuk ditampilkan pada grafik.',
  actionTo: '',
  actionLabel: '',
})

const numbers = new Intl.NumberFormat('id-ID')
const maxValue = computed(() => {
  let max = 0
  for (const r of props.rows) {
    if (r.primary > max) max = r.primary
    if ((r.secondary ?? 0) > max) max = r.secondary ?? 0
  }
  return Math.max(1, max)
})
const hasSecondary = computed(() => !!props.secondaryLabel)

function pct(v: number) {
  if (v <= 0) return '0%'
  return `${Math.max(4, Math.round((v / maxValue.value) * 100))}%`
}
</script>

<template>
  <section class="panel chart-card" :aria-label="title">
    <div class="chart-head">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle" class="muted">{{ subtitle }}</p>
      </div>
      <NuxtLink v-if="actionTo && actionLabel" class="workspace-text-action" :to="actionTo">{{ actionLabel }}</NuxtLink>
    </div>

    <div v-if="rows.length" class="bar-series-legend">
      <span class="series-item">
        <span class="legend-dot" :style="{ background: primaryColor }" aria-hidden="true" />
        {{ primaryLabel }}
      </span>
      <span v-if="hasSecondary" class="series-item">
        <span class="legend-dot" :style="{ background: secondaryColor }" aria-hidden="true" />
        {{ secondaryLabel }}
      </span>
    </div>

    <p v-if="!rows.length" class="muted chart-empty">{{ emptyText }}</p>

    <div v-else-if="layout === 'vertical'" class="vchart-grid">
      <div v-for="row in rows" :key="row.label" class="vchart-col">
        <div class="vchart-bars">
          <div class="vbar-slot">
            <span class="vbar-num">{{ numbers.format(row.primary) }}</span>
            <div class="vbar-track">
              <div class="vbar-fill" :style="{ height: pct(row.primary), background: row.color || primaryColor }" />
            </div>
          </div>
          <div v-if="hasSecondary" class="vbar-slot">
            <span class="vbar-num">{{ numbers.format(row.secondary ?? 0) }}</span>
            <div class="vbar-track">
              <div class="vbar-fill" :style="{ height: pct(row.secondary ?? 0), background: secondaryColor }" />
            </div>
          </div>
        </div>
        <span class="vchart-label">{{ row.label }}</span>
      </div>
    </div>

    <div v-else class="hchart-list">
      <div v-for="row in rows" :key="row.label" class="hchart-row">
        <div class="hchart-meta">
          <span class="hchart-label">{{ row.label }}</span>
          <span class="hchart-vals">
            <strong>{{ numbers.format(row.primary) }}</strong>
            <template v-if="hasSecondary">
              <span class="muted"> / {{ numbers.format(row.secondary ?? 0) }}</span>
            </template>
          </span>
        </div>
        <div class="hchart-tracks">
          <div class="hbar-track">
            <div class="hbar-fill" :style="{ width: pct(row.primary), background: row.color || primaryColor }" />
          </div>
          <div v-if="hasSecondary" class="hbar-track">
            <div class="hbar-fill" :style="{ width: pct(row.secondary ?? 0), background: secondaryColor }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chart-card { display: grid; gap: 1rem; padding: clamp(1rem, 1.5cqi, 1.375rem); border-radius: 1rem; min-width: 0; align-content: start; }
.chart-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; border-bottom: 1px solid var(--line); padding-bottom: .75rem; }
.chart-head h2 { font-size: 1.0625rem; font-weight: 600; letter-spacing: -.02em; }
.chart-head p { margin-top: .25rem; font-size: .875rem; line-height: 1.45; }
.bar-series-legend { display: flex; flex-wrap: wrap; gap: 1rem; font-size: .8125rem; font-weight: 600; color: var(--muted); }
.series-item { display: inline-flex; align-items: center; gap: .45rem; }
.legend-dot { width: 8px; height: 8px; border-radius: 999px; flex: 0 0 8px; }
.chart-empty { padding-block: 1rem; font-size: .9375rem; }

.hchart-list { display: grid; gap: .875rem; }
.hchart-row { display: grid; gap: .375rem; }
.hchart-meta { display: flex; justify-content: space-between; align-items: baseline; gap: .75rem; font-size: .875rem; }
.hchart-label { font-weight: 500; color: var(--ink); overflow-wrap: anywhere; }
.hchart-vals { flex-shrink: 0; font-size: .875rem; }
.hchart-tracks { display: grid; gap: .3rem; }
.hbar-track { height: 9px; background: var(--line); border-radius: 999px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 999px; transition: width 320ms ease; }

.vchart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(3.75rem, 1fr)); gap: .75rem; align-items: end; padding-top: .5rem; }
.vchart-col { display: grid; gap: .5rem; justify-items: center; }
.vchart-bars { display: flex; align-items: flex-end; gap: .375rem; height: 8.5rem; }
.vbar-slot { display: flex; flex-direction: column; align-items: center; gap: .25rem; height: 100%; justify-content: flex-end; }
.vbar-num { font-size: .8125rem; font-weight: 600; color: var(--ink); }
.vbar-track { width: 1.25rem; height: 6.75rem; background: var(--line); border-radius: 6px 6px 2px 2px; display: flex; align-items: flex-end; overflow: hidden; }
.vbar-fill { width: 100%; border-radius: 6px 6px 2px 2px; transition: height 320ms ease; }
.vchart-label { font-size: .8125rem; font-weight: 600; color: var(--muted); text-align: center; }
</style>
