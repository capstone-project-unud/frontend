<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import FileUpload from './FileUpload.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { ExpoSubmission, Project } from '../types'

const api = useCapstone()
const { student, coordinator, busy, error, message } = api
const isAdmin = computed(() => api.user.value?.roles.includes('ADMIN') ?? false)
const fetcher = useRequestFetch()
const tab = shallowRef<'gallery' | 'manage'>('gallery')

const { data: galleryData, refresh: refreshGallery } = await useAsyncData('expo-gallery', () => fetcher<{ items: ExpoSubmission[] }>(capstoneAPI + '/expo', { query: { published: 'true' } }))
const { data: manageData, status, error: loadError, refresh: refreshManage } = await useAsyncData('expo-manage', () => fetcher<{ items: ExpoSubmission[] }>(capstoneAPI + '/expo'))
const { data: myProjects } = await useAsyncData('expo-projects', () => fetcher<{ items: Project[] }>(capstoneAPI + '/projects', { query: { status: 'FINALIZED' } }))

const categoryOptions = [
  { value: 'SOFTWARE', label: 'Aplikasi / Sistem Software' },
  { value: 'HARDWARE', label: 'Hardware / Prototipe Alat IoT' },
  { value: 'ALGORITMA', label: 'Algoritma & Pemodelan Data' },
  { value: 'DOKUMEN_STRATEGIS', label: 'Dokumen Strategis / Tata Kelola TI' },
]

const projectOptions = computed(() => (myProjects.value?.items || []).map(p => ({ value: p.id, label: p.title })))
const form = reactive({
  project_id: '', title: '', category: 'SOFTWARE', abstract_id: '', abstract_en: '',
  poster_file_id: null as string | null, video_url: '', repo_url: '', demo_url: '',
  journal_title: '', journal_class: '', journal_url: '', publication_consent: false, submit: true,
})

watch(myProjects, (val) => {
  if (!form.project_id && val?.items.length) {
    form.project_id = val.items[0]!.id
    if (!form.title) form.title = val.items[0]!.title
  }
}, { immediate: true })

const existing = computed(() => (manageData.value?.items || []).find(i => i.project_id === form.project_id))
watch(existing, (e) => {
  if (e) {
    form.title = e.title; form.category = e.category; form.abstract_id = e.abstract_id; form.abstract_en = e.abstract_en
    form.poster_file_id = e.poster_file_id; form.video_url = e.video_url; form.repo_url = e.repo_url; form.demo_url = e.demo_url
    form.journal_title = e.journal_title; form.journal_class = e.journal_class; form.journal_url = e.journal_url; form.publication_consent = e.publication_consent
  }
}, { immediate: true })

async function saveExpo() {
  if (await api.mutate('/expo', { ...form, version: existing.value?.version || 0 })) {
    await Promise.all([refreshGallery(), refreshManage()])
  }
}

const reviewNotes = reactive<Record<string, string>>({})
async function reviewExpo(item: ExpoSubmission, nextStatus: 'APPROVED' | 'PUBLISHED' | 'REVISION') {
  if (await api.mutate(`/expo/${item.id}/review`, { status: nextStatus, note: reviewNotes[item.id] || '', version: item.version }, 'PUT')) {
    reviewNotes[item.id] = ''
    await Promise.all([refreshGallery(), refreshManage()])
  }
}
</script>

<template>
  <section class="expo-stack">
    <div class="tab-bar" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'gallery'" class="tab-btn" :class="{ active: tab === 'gallery' }" @click="tab = 'gallery'">
        Galeri karya publik ({{ galleryData?.items.length ?? 0 }})
      </button>
      <button type="button" role="tab" :aria-selected="tab === 'manage'" class="tab-btn" :class="{ active: tab === 'manage' }" @click="tab = 'manage'">
        Pengajuan &amp; kurasi Expo ({{ manageData?.items.length ?? 0 }})
      </button>
    </div>

    <div v-if="tab === 'gallery'" class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Galeri karya Capstone Expo</h2>
          <span>{{ galleryData?.items.length ?? 0 }} karya diterbitkan</span>
        </div>
      </div>
      <div v-if="!galleryData?.items.length" class="empty-state">
        <h2>Belum ada karya Expo yang diterbitkan</h2>
        <p>Karya capstone yang lulus Ujian Akhir dan disetujui Admin untuk publikasi akan tampil pada galeri showcase di sini.</p>
      </div>
      <div v-else class="cap-panel-items">
        <article v-for="ex in galleryData.items" :key="ex.id" class="cap-panel-item">
          <div class="cap-section-heading">
            <div>
              <h2>{{ ex.title }}</h2>
              <p class="muted">{{ ex.interest_name }} · Kategori: {{ ex.category }}</p>
            </div>
            <StatusLabel :value="ex.status" />
          </div>
          <p class="cap-preserve">{{ ex.abstract_id }}</p>
          <div class="cap-actions">
            <a v-if="ex.poster_file_id" class="button primary" :href="`${capstoneAPI}/files/${ex.poster_file_id}`">Poster X-Banner (PDF)</a>
            <a v-if="ex.repo_url" class="button secondary" :href="ex.repo_url" target="_blank" rel="noopener">Repositori GitHub</a>
            <a v-if="ex.video_url" class="button secondary" :href="ex.video_url" target="_blank" rel="noopener">Video Demo</a>
            <a v-if="ex.demo_url" class="button secondary" :href="ex.demo_url" target="_blank" rel="noopener">Live Demo</a>
          </div>
        </article>
      </div>
    </div>

    <template v-else>
      <form v-if="student && projectOptions.length" class="panel cap-section" @submit.prevent="saveExpo">
        <h2>Pengajuan materi Capstone Expo</h2>
        <p class="muted">Lampirkan Poster Ilmiah / X-Banner 60x160 cm (PDF), Video Demo (5–15 menit), tautan GitHub showcase, serta luaran Jurnal Ilmiah.</p>
        <fieldset class="cap-fieldset" :disabled="busy">
          <div class="field-row">
            <div class="field"><label for="expo-proj">Proyek capstone</label><WorkspaceSelect id="expo-proj" v-model="form.project_id" label="Proyek" :options="projectOptions" required /></div>
            <div class="field"><label for="expo-cat">Kategori produk</label><WorkspaceSelect id="expo-cat" v-model="form.category" label="Kategori" :options="categoryOptions" required /></div>
          </div>
          <div class="field"><label>Judul publikasi karya</label><input v-model="form.title" required minlength="5" maxlength="500"></div>
          <div class="field"><label>Abstrak Bahasa Indonesia</label><textarea v-model="form.abstract_id" rows="3" required minlength="20" maxlength="10000" /></div>
          <div class="field-row">
            <div class="field"><label>Tautan repositori GitHub</label><input v-model="form.repo_url" type="url" placeholder="https://github.com/..." :required="form.submit"></div>
            <div class="field"><label>Tautan Video Demonstrasi Produk</label><input v-model="form.video_url" type="url" placeholder="https://youtu.be/..." :required="form.submit"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Tautan demo produk (opsional)</label><input v-model="form.demo_url" type="url" placeholder="https://..."></div>
            <div class="field"><label>Judul / Tautan Jurnal Ilmiah (opsional)</label><input v-model="form.journal_url" type="url" placeholder="https://..."></div>
          </div>
          <FileUpload v-model="form.poster_file_id" label="Poster Ilmiah / X-Banner 60x160 cm (PDF)" />
          <label class="check-field"><input v-model="form.publication_consent" type="checkbox">Kelompok menyetujui publikasi karya showcase pada Galeri Publik PSTI Unud.</label>
          <label class="check-field"><input v-model="form.submit" type="checkbox">Ajukan langsung untuk kurasi &amp; persetujuan publikasi (memerlukan kelulusan Ujian Akhir).</label>
        </fieldset>
        <div class="cap-actions"><button class="button primary" :disabled="busy">Simpan materi Expo</button></div>
      </form>

      <div class="panel workspace-panel cap-list-panel">
        <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Kurasi &amp; persetujuan publikasi Expo</h2></div></div>
        <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
        <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
        <p v-if="status === 'pending'" class="cap-loading" role="status">Memuat pengajuan Expo…</p>
        <div v-else-if="loadError" class="empty-state"><button class="button secondary" @click="refreshManage()">Coba lagi</button></div>
        <div v-else-if="!manageData?.items.length" class="empty-state"><h3>Belum ada pengajuan Expo</h3></div>
        <div v-else class="cap-panel-items">
          <article v-for="item in manageData.items" :key="item.id" class="cap-panel-item">
            <div class="cap-section-heading">
              <div><h3>{{ item.title }}</h3><p class="muted">{{ item.interest_name }} · {{ item.category }}</p></div>
              <StatusLabel :value="item.status" />
            </div>
            <div class="cap-actions">
              <a v-if="item.poster_file_id" class="workspace-text-action" :href="`${capstoneAPI}/files/${item.poster_file_id}`">Poster X-Banner</a>
              <a v-if="item.repo_url" class="workspace-text-action" :href="item.repo_url" target="_blank" rel="noopener">GitHub</a>
              <a v-if="item.video_url" class="workspace-text-action" :href="item.video_url" target="_blank" rel="noopener">Video Demo</a>
            </div>
            <p v-if="item.review_note" class="notice">Catatan kurasi: {{ item.review_note }}</p>
            <div v-if="(isAdmin || coordinator)" class="cap-review">
              <input v-model="reviewNotes[item.id]" maxlength="2000" placeholder="Catatan kurasi / izin publikasi">
              <div class="cap-actions">
                <button type="button" class="button secondary" :disabled="busy" @click="reviewExpo(item, 'APPROVED')">Setujui Materi</button>
                <button type="button" class="button primary" :disabled="busy" @click="reviewExpo(item, 'PUBLISHED')">Terbitkan ke Galeri</button>
                <button type="button" class="button secondary" :disabled="busy" @click="reviewExpo(item, 'REVISION')">Minta Perbaikan</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.expo-stack { display: grid; gap: 1.5rem; }
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.tab-bar { display: flex; gap: .5rem; flex-wrap: wrap; }
.tab-btn { padding: .625rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: var(--panel); color: var(--muted); font-weight: 600; font-size: .875rem; }
.tab-btn.active { border-color: var(--accent); color: var(--accent); }
@media (max-width: 720px) { .field-row { grid-template-columns: minmax(0, 1fr); } }
</style>
