<script setup lang="ts">
import type { ShowcaseWork } from '../types'
import ShowcasePosterPreview from './ShowcasePosterPreview.vue'

const props = defineProps<{ work: ShowcaseWork | null }>()
const emit = defineEmits<{ close: [] }>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
watch(() => props.work, async (val) => {
  await nextTick()
  if (val && !dialog.value?.open) dialog.value?.showModal()
  if (!val && dialog.value?.open) dialog.value?.close()
}, { immediate: true })
</script>

<template>
  <dialog ref="dialog" class="cap-dialog showcase-dialog" aria-labelledby="showcase-dialog-title" @cancel.prevent="emit('close')">
    <div v-if="work" class="showcase-dialog-body">
      <div class="cap-section-heading">
        <div>
          <span class="showcase-kicker">{{ work.group_code }} · {{ work.academic_period_name }} · {{ work.interest_name }}</span>
          <h2 id="showcase-dialog-title">{{ work.title }}</h2>
        </div>
        <button type="button" class="button secondary" @click="emit('close')">Tutup</button>
      </div>

      <p class="notice" role="status">
        {{ work.is_mock_preview ? 'Contoh karya untuk pratinjau galeri.' : 'Karya ini telah disetujui terbit pada Galeri Publik Capstone Expo PSTI Unud.' }}
      </p>

      <div class="abstract-box">
        <h3>Abstrak Karya</h3>
        <p>{{ work.abstract_id }}</p>
        <p v-if="work.abstract_en" class="muted abstract-en">{{ work.abstract_en }}</p>
      </div>

      <ShowcasePosterPreview
        :title="work.title"
        :group-code="work.group_code"
        :category-label="work.category_label"
        :interest-name="work.interest_name"
        :poster="work.poster"
      />

      <div class="people-grid">
        <section class="people-card">
          <h3>Tim Mahasiswa ({{ work.members.length }} Anggota)</h3>
          <ul>
            <li v-for="m in work.members" :key="m.nim">
              <strong>{{ m.name }}</strong> ({{ m.nim }})
              <span v-if="m.is_leader" class="leader-label"> · Ketua Kelompok</span>
              <small class="muted">{{ m.responsibility }}</small>
            </li>
          </ul>
        </section>

        <section class="people-card">
          <h3>Dosen Pembimbing &amp; Luaran</h3>
          <ul>
            <li><strong>Pembimbing 1</strong><small class="muted">{{ work.supervisors[0] }}</small></li>
            <li><strong>Pembimbing 2</strong><small class="muted">{{ work.supervisors[1] }}</small></li>
            <li><strong>Publikasi Ilmiah ({{ work.journal_class }})</strong><small class="muted">{{ work.journal_title }}</small></li>
          </ul>
        </section>
      </div>

      <div class="cap-dialog-actions">
        <a v-if="work.repo_url" class="button secondary" :href="work.repo_url" target="_blank" rel="noopener">Repositori GitHub</a>
        <a v-if="work.video_url" class="button secondary" :href="work.video_url" target="_blank" rel="noopener">Video Demonstrasi</a>
        <a v-if="work.demo_url" class="button primary" :href="work.demo_url" target="_blank" rel="noopener">Buka Demo Produk</a>
        <button type="button" class="button secondary" @click="emit('close')">Selesai meninjau</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.showcase-dialog { width: min(920px, calc(100% - 2rem)); padding: 1.75rem; }
.showcase-dialog-body { display: grid; gap: 1.25rem; }
.showcase-kicker { display: block; font-size: .8125rem; font-weight: 600; color: var(--accent); margin-bottom: .35rem; }
.showcase-dialog h2 { font-size: 1.375rem; font-weight: 650; letter-spacing: -.025em; line-height: 1.35; }
.abstract-box { display: grid; gap: .45rem; }
.abstract-box h3, .people-card h3 { font-size: .9375rem; font-weight: 650; margin: 0; }
.abstract-box p { font-size: .9375rem; line-height: 1.65; }
.abstract-en { font-style: italic; font-size: .875rem; }
.people-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.people-card { padding: 1rem; border: 1px solid var(--border); border-radius: 12px; background: var(--canvas); display: grid; gap: .6rem; align-content: start; }
.people-card ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .55rem; }
.people-card li { border-top: 1px solid var(--line); padding-top: .5rem; font-size: .875rem; }
.people-card li:first-child { border-top: 0; padding-top: 0; }
.people-card small { display: block; margin-top: .15rem; }
.leader-label { color: var(--accent); font-weight: 650; }
.showcase-dialog .cap-dialog-actions { margin: .25rem -1.75rem -1.75rem; padding: 1.125rem 1.75rem; }
@media (max-width: 720px) {
  .showcase-dialog { padding: 1.25rem; }
  .showcase-dialog .cap-dialog-actions { margin: 0 -1.25rem -1.25rem; padding: 1rem 1.25rem; }
  .people-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
