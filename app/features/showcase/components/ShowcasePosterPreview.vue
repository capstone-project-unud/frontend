<script setup lang="ts">
import type { ShowcasePosterContent } from '../types'

defineProps<{
  title: string
  groupCode: string
  categoryLabel: string
  interestName: string
  poster: ShowcasePosterContent
}>()
</script>

<template>
  <section class="poster-sheet" aria-label="Pratinjau struktur Poster Ilmiah X-Banner 60 x 160 cm">
    <header class="poster-banner-head">
      <span class="poster-spec">POSTER ILMIAH X-BANNER (60 &times; 160 CM) · {{ groupCode }}</span>
      <h3>{{ title }}</h3>
      <p class="muted">{{ interestName }} · {{ categoryLabel }}</p>
    </header>

    <div class="poster-columns">
      <div class="poster-block">
        <h4>1. Latar Belakang Masalah</h4>
        <p>{{ poster.problem_summary }}</p>
      </div>

      <div class="poster-block">
        <h4>2. Blok Diagram &amp; Arsitektur Sistem</h4>
        <div class="arch-flow" role="img" :aria-label="'Alur arsitektur: ' + poster.architecture_nodes.join(' ke ')">
          <template v-for="(node, idx) in poster.architecture_nodes" :key="node">
            <span class="arch-node">{{ node }}</span>
            <span v-if="idx < poster.architecture_nodes.length - 1" class="arch-arrow" aria-hidden="true">&#8594;</span>
          </template>
        </div>
        <p class="muted">{{ poster.architecture_summary }}</p>
      </div>

      <div class="poster-block">
        <h4>3. Hasil Pengujian Utama</h4>
        <ul class="metric-bars">
          <li v-for="m in poster.test_highlights" :key="m.label">
            <div class="metric-bar-head">
              <span>{{ m.label }}</span>
              <strong>{{ m.value }}</strong>
            </div>
            <div class="metric-bar-track">
              <div class="metric-bar-fill" :style="{ width: `${Math.min(100, Math.max(8, m.score_pct))}%` }" />
            </div>
          </li>
        </ul>
      </div>

      <div class="poster-block">
        <h4>4. Kesimpulan &amp; Kelayakan</h4>
        <p>{{ poster.conclusion }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.poster-sheet { border: 1px solid var(--border); border-radius: 14px; background: var(--canvas); overflow: hidden; display: grid; }
.poster-banner-head { padding: 1.125rem 1.25rem; background: var(--panel); border-bottom: 1px solid var(--line); display: grid; gap: .35rem; }
.poster-spec { font-size: .75rem; font-weight: 700; letter-spacing: .06em; color: var(--accent); }
.poster-banner-head h3 { font-size: 1rem; font-weight: 650; line-height: 1.4; }
.poster-banner-head p { font-size: .875rem; }
.poster-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; padding: 1.125rem 1.25rem; }
.poster-block { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: .875rem 1rem; display: grid; gap: .55rem; align-content: start; }
.poster-block h4 { font-size: .875rem; font-weight: 650; color: var(--accent); margin: 0; }
.poster-block p { font-size: .875rem; line-height: 1.55; }
.arch-flow { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; }
.arch-node { padding: .35rem .6rem; border: 1px solid var(--border); border-radius: 8px; background: var(--canvas); font-size: .8125rem; font-weight: 600; }
.arch-arrow { color: var(--muted); font-weight: 600; }
.metric-bars { list-style: none; padding: 0; margin: 0; display: grid; gap: .55rem; }
.metric-bar-head { display: flex; justify-content: space-between; font-size: .8125rem; margin-bottom: .25rem; gap: .5rem; }
.metric-bar-track { height: 7px; border-radius: 999px; background: var(--line); overflow: hidden; }
.metric-bar-fill { height: 100%; border-radius: 999px; background: var(--accent); }
@media (max-width: 720px) { .poster-columns { grid-template-columns: minmax(0, 1fr); } }
</style>
