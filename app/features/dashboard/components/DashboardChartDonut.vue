<script setup lang="ts">
import type { ChartSegment } from '../types'

const props = defineProps<{
  title: string
  subtitle?: string
  centerLabel: string
  segments: ChartSegment[]
  actionTo?: string
  actionLabel?: string
}>()

const radius = 52
const circumference = 2 * Math.PI * radius
const activeIndex = shallowRef<number | null>(null)
const numbers = new Intl.NumberFormat('id-ID')

const total = computed(() => props.segments.reduce((acc, s) => acc + Math.max(0, s.value), 0))

const arcs = computed(() => {
  let offset = 0
  return props.segments.map((seg, idx) => {
    const val = Math.max(0, seg.value)
    const len = total.value > 0 ? (val / total.value) * circumference : 0
    const currentOffset = offset
    offset += len
    return {
      ...seg,
      idx,
      val,
      len,
      offset: currentOffset,
      pct: total.value > 0 ? Math.round((val / total.value) * 100) : 0,
    }
  })
})

const highlighted = computed(() => activeIndex.value !== null ? arcs.value[activeIndex.value] ?? null : null)
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

    <div class="donut-layout">
      <div class="donut-wrap">
        <svg viewBox="0 0 140 140" class="donut-svg" role="img" :aria-label="`${title}: total ${total}`">
          <circle cx="70" cy="70" :r="radius" fill="none" stroke="var(--line)" stroke-width="14" />
          <g v-if="total > 0" transform="rotate(-90 70 70)">
            <circle
              v-for="arc in arcs"
              v-show="arc.val > 0"
              :key="arc.label"
              cx="70"
              cy="70"
              :r="radius"
              fill="none"
              :stroke="arc.color"
              :stroke-width="activeIndex === arc.idx ? 17 : 14"
              :stroke-dasharray="`${arc.len} ${circumference}`"
              :stroke-dashoffset="-arc.offset"
              class="donut-arc"
              @mouseenter="activeIndex = arc.idx"
              @mouseleave="activeIndex = null"
            />
          </g>
        </svg>
        <div class="donut-center">
          <strong>{{ numbers.format(highlighted ? highlighted.val : total) }}</strong>
          <span>{{ highlighted ? highlighted.label : centerLabel }}</span>
        </div>
      </div>

      <ul class="chart-legend">
        <li
          v-for="arc in arcs"
          :key="arc.label"
          :class="{ 'is-active': activeIndex === arc.idx }"
          tabindex="0"
          @mouseenter="activeIndex = arc.idx"
          @mouseleave="activeIndex = null"
          @focus="activeIndex = arc.idx"
          @blur="activeIndex = null"
        >
          <span class="legend-key">
            <span class="legend-dot" :style="{ background: arc.color }" aria-hidden="true" />
            <span>{{ arc.label }}</span>
          </span>
          <span class="legend-val">
            <strong>{{ numbers.format(arc.val) }}</strong>
            <small>{{ arc.pct }}%</small>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.chart-card { display: grid; gap: 1rem; padding: clamp(1rem, 1.5cqi, 1.375rem); border-radius: 1rem; min-width: 0; align-content: start; }
.chart-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; border-bottom: 1px solid var(--line); padding-bottom: .75rem; }
.chart-head h2 { font-size: 1.0625rem; font-weight: 600; letter-spacing: -.02em; }
.chart-head p { margin-top: .25rem; font-size: .875rem; line-height: 1.45; }
.donut-layout { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 1.25rem; align-items: center; }
.donut-wrap { position: relative; width: 9.25rem; height: 9.25rem; display: grid; place-items: center; flex-shrink: 0; }
.donut-svg { width: 100%; height: 100%; overflow: visible; }
.donut-arc { cursor: pointer; transition: stroke-width 150ms ease, stroke-dasharray 300ms ease; }
.donut-center { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; pointer-events: none; padding-inline: 1.1rem; }
.donut-center strong { font-size: 1.5rem; font-weight: 600; line-height: 1.15; letter-spacing: -.03em; color: var(--ink); }
.donut-center span { font-size: .8125rem; font-weight: 500; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chart-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; min-width: 0; }
.chart-legend li { display: flex; justify-content: space-between; align-items: center; gap: .75rem; padding: .35rem .5rem; border-radius: 8px; border: 1px solid transparent; font-size: .875rem; cursor: default; transition: background-color 150ms ease, border-color 150ms ease; }
.chart-legend li.is-active, .chart-legend li:focus-visible { background: var(--canvas); border-color: var(--border); outline: none; }
.legend-key { display: flex; align-items: center; gap: .5rem; min-width: 0; }
.legend-key span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend-dot { width: 8px; height: 8px; border-radius: 999px; flex: 0 0 8px; }
.legend-val { display: flex; align-items: baseline; gap: .375rem; flex-shrink: 0; }
.legend-val strong { font-weight: 600; color: var(--ink); }
.legend-val small { font-size: .8125rem; color: var(--muted); min-width: 2.35rem; text-align: right; }
@media (max-width: 520px) { .donut-layout { grid-template-columns: minmax(0, 1fr); justify-items: center; } .chart-legend { width: 100%; } }
</style>
