<script setup lang="ts">
import FileUpload from './FileUpload.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { ChatMessage, ChatSession, KnowledgeSource } from '../types'
import { dateTime } from '~/utils/format'

const api = useCapstone()
const { busy, error, message } = api
const isAdmin = computed(() => api.user.value?.roles.includes('ADMIN') ?? false)
const fetcher = useRequestFetch()
const tab = shallowRef<'chat' | 'kb'>('chat')

const { data: sessionsData, refresh: refreshSessions } = await useAsyncData('assistant-sessions', () => fetcher<{ items: ChatSession[] }>(capstoneAPI + '/assistant/sessions'))
const { data: sourcesData, refresh: refreshSources } = await useAsyncData('assistant-sources', () => fetcher<{ items: KnowledgeSource[] }>(capstoneAPI + '/assistant/sources'))

const activeSessionID = shallowRef<string | null>(null)
const question = shallowRef('')

watch(sessionsData, (val) => {
  if (!activeSessionID.value && val?.items.length) activeSessionID.value = val.items[0]!.id
}, { immediate: true })

const currentSession = computed(() => (sessionsData.value?.items || []).find(s => s.id === activeSessionID.value) || null)

async function sendQuestion() {
  if (!question.value.trim()) return
  const res = await api.mutate<{ session_id: string; message: ChatMessage }>('/assistant/chat', {
    session_id: activeSessionID.value,
    question: question.value,
  })
  if (res) {
    question.value = ''
    activeSessionID.value = res.session_id
    await refreshSessions()
  }
}

function quickAsk(prompt: string) {
  question.value = prompt
  return sendQuestion()
}

const kbForm = reactive({
  code: 'PANDUAN-PSTI-UNUD',
  title: '',
  version_label: '',
  effective_date: new Date().toISOString().slice(0, 10),
  approval_proof: '',
  source_file_id: null as string | null,
  raw_text: '',
})
const kbTestResult = shallowRef<string>('')

async function createSource() {
  if (await api.mutate('/assistant/sources', kbForm)) {
    kbForm.title = ''; kbForm.version_label = ''; kbForm.approval_proof = ''; kbForm.raw_text = ''; kbForm.source_file_id = null
    await refreshSources()
  }
}
async function indexSource(id: string) {
  if (await api.mutate(`/assistant/sources/${id}/index`, {})) await refreshSources()
}
async function testSource(id: string) {
  const res = await api.mutate<{ test_status: string; answer: string }>(`/assistant/sources/${id}/test`, { query: 'syarat' })
  if (res) {
    kbTestResult.value = `Status uji: ${res.test_status} — ${res.answer.slice(0, 180)}…`
    await refreshSources()
  }
}
async function activateSource(id: string) {
  if (await api.mutate(`/assistant/sources/${id}/activate`, {})) await refreshSources()
}
</script>

<template>
  <section class="assistant-stack">
    <div v-if="isAdmin" class="tab-bar" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'chat'" class="tab-btn" :class="{ active: tab === 'chat' }" @click="tab = 'chat'">Tanya Pedoman Capstone</button>
      <button type="button" role="tab" :aria-selected="tab === 'kb'" class="tab-btn" :class="{ active: tab === 'kb' }" @click="tab = 'kb'">Kelola dokumen sumber</button>
    </div>

    <div v-if="tab === 'chat'" class="assistant-grid">
      <aside class="panel workspace-panel session-list" aria-label="Riwayat percakapan">
        <div class="workspace-panel-header">
          <div class="workspace-panel-title"><h2>Percakapan</h2></div>
          <button type="button" class="workspace-text-action" @click="activeSessionID = null">+ Baru</button>
        </div>
        <div class="cap-panel-items">
          <button
            v-for="s in sessionsData?.items || []"
            :key="s.id"
            type="button"
            class="session-item"
            :class="{ active: s.id === activeSessionID }"
            @click="activeSessionID = s.id"
          >
            <strong>{{ s.title }}</strong>
            <small class="muted">{{ dateTime(s.updated_at) }}</small>
          </button>
          <p v-if="!sessionsData?.items.length" class="cap-panel-item muted">Belum ada riwayat pertanyaan.</p>
        </div>
      </aside>

      <div class="panel workspace-panel cap-list-panel">
        <div class="workspace-panel-header">
          <div class="workspace-panel-title">
            <h2>Asisten Capstone</h2>
            <span>Sumber aktif: {{ sourcesData?.items.find(s => s.status === 'ACTIVE')?.version_label || 'Pedoman Resmi' }}</span>
          </div>
        </div>

        <div class="quick-prompts">
          <button type="button" class="button secondary" :disabled="busy" @click="quickAsk('Bagaimana syarat membentuk kelompok dan mengajukan topik?')">Syarat kelompok</button>
          <button type="button" class="button secondary" :disabled="busy" @click="quickAsk('Apa saja dokumen Seri B-100 sampai B-400 dan syarat Sempro?')">Dokumen B-Series &amp; Sempro</button>
          <button type="button" class="button secondary" :disabled="busy" @click="quickAsk('Apa saja 11 syarat mendaftar Ujian Akhir capstone?')">11 syarat Ujian Akhir</button>
          <button type="button" class="button secondary" :disabled="busy" @click="quickAsk('Bagaimana ukuran poster dan syarat publikasi Expo?')">Ketentuan Expo</button>
        </div>

        <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>

        <div class="chat-thread">
          <template v-if="currentSession?.messages.length">
            <article v-for="m in currentSession.messages" :key="m.id" class="chat-msg" :class="m.role.toLowerCase()">
              <div class="cap-section-heading">
                <strong>{{ m.role === 'USER' ? 'Anda' : 'Asisten Pedoman' }}</strong>
                <StatusLabel v-if="m.role === 'ASSISTANT'" :value="m.status" />
              </div>
              <p class="cap-preserve">{{ m.content }}</p>
              <div v-if="m.citations?.length" class="citation-list">
                <small v-for="(c, idx) in m.citations" :key="idx" class="citation-pill">
                  Rujukan {{ idx + 1 }}: {{ c.source_title }} — {{ c.section_title }} ({{ c.page_ref }} · {{ c.version_label }})
                </small>
              </div>
            </article>
          </template>
          <div v-else class="empty-state">
            <h2>Apa yang ingin Anda tanyakan?</h2>
            <p>Tanyakan tentang pendaftaran, bimbingan, ujian, atau Expo.</p>
          </div>
        </div>

        <form class="chat-composer" @submit.prevent="sendQuestion">
          <div class="field">
            <label for="chat-input" class="visually-hidden">Pertanyaan pedoman</label>
            <textarea id="chat-input" v-model="question" rows="2" required minlength="3" maxlength="1000" placeholder="Tulis pertanyaan Anda mengenai pedoman Capstone Project…" />
          </div>
          <button class="button primary" :disabled="busy || !question.trim()">{{ busy ? 'Mencari rujukan…' : 'Tanya asisten' }}</button>
        </form>
      </div>
    </div>

    <template v-else-if="isAdmin">
      <form class="panel cap-section" @submit.prevent="createSource">
        <h2>Tambah dokumen sumber</h2>
        <p class="muted">Pisahkan setiap bagian dokumen dengan baris kosong.</p>
        <fieldset class="cap-fieldset" :disabled="busy">
          <div class="field-row">
            <div class="field"><label>Kode pedoman</label><input v-model="kbForm.code" required minlength="3" maxlength="60"></div>
            <div class="field"><label>Versi pedoman</label><input v-model="kbForm.version_label" required placeholder="Misal: v2026.2"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Judul pedoman</label><input v-model="kbForm.title" required minlength="5" maxlength="300"></div>
            <div class="field"><label>Tanggal berlaku</label><input v-model="kbForm.effective_date" type="date" required></div>
          </div>
          <div class="field"><label>Bukti / Dasar Pengesahan</label><input v-model="kbForm.approval_proof" maxlength="300" placeholder="Misal: SK Koordinator Prodi No. ..."></div>
          <FileUpload v-model="kbForm.source_file_id" label="Lampiran PDF pedoman resmi (opsional)" />
          <div class="field"><label>Isi dokumen</label><textarea v-model="kbForm.raw_text" rows="5" required minlength="30" /></div>
        </fieldset>
        <div class="cap-actions"><button class="button primary" :disabled="busy">Simpan draf sumber pedoman</button></div>
      </form>

      <div class="panel workspace-panel cap-list-panel">
        <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Daftar versi sumber pedoman</h2></div></div>
        <p v-if="message" class="notice success cap-panel-feedback">{{ message }}</p>
        <p v-if="kbTestResult" class="notice cap-panel-feedback">{{ kbTestResult }}</p>
        <div class="cap-panel-items">
          <article v-for="src in sourcesData?.items || []" :key="src.id" class="cap-panel-item">
            <div class="cap-section-heading">
              <div>
                <h3>{{ src.title }} ({{ src.version_label }})</h3>
                <p class="muted">{{ src.code }} · Berlaku: {{ src.effective_date }} · {{ src.chunk_count }} potongan terindeks · Uji: {{ src.last_test_status }}</p>
              </div>
              <StatusLabel :value="src.status" />
            </div>
            <div class="cap-actions">
              <button type="button" class="button secondary" :disabled="busy" @click="indexSource(src.id)">1. Indeks teks</button>
              <button type="button" class="button secondary" :disabled="busy || src.chunk_count === 0" @click="testSource(src.id)">2. Uji jawaban &amp; rujukan</button>
              <button type="button" class="button primary" :disabled="busy || src.last_test_status !== 'PASSED' || src.status === 'ACTIVE'" @click="activateSource(src.id)">3. Aktifkan versi</button>
            </div>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.assistant-stack { display: grid; gap: 1.5rem; }
.assistant-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 1.25rem; align-items: start; }
.session-item { text-align: left; display: grid; gap: .2rem; padding: .875rem 1.125rem; border: 0; border-top: 1px solid var(--line); background: transparent; color: var(--ink); width: 100%; }
.session-item:hover, .session-item.active { background: var(--panel-hover); }
.session-item.active strong { color: var(--accent); }
.quick-prompts { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0 1.5rem 1rem; border-bottom: 1px solid var(--line); }
.chat-thread { display: grid; gap: 1rem; padding: 1.25rem 1.5rem; max-height: 520px; overflow-y: auto; }
.chat-msg { padding: 1rem; border: 1px solid var(--border); border-radius: 12px; display: grid; gap: .5rem; }
.chat-msg.user { background: var(--panel-hover); }
.chat-msg.assistant { background: var(--canvas); }
.citation-list { display: grid; gap: .25rem; border-top: 1px solid var(--line); padding-top: .5rem; }
.citation-pill { color: var(--muted); font-size: .8125rem; }
.chat-composer { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .75rem; align-items: end; padding: 1rem 1.5rem; border-top: 1px solid var(--line); }
.tab-bar { display: flex; gap: .5rem; flex-wrap: wrap; }
.tab-btn { padding: .625rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: var(--panel); color: var(--muted); font-weight: 600; font-size: .875rem; }
.tab-btn.active { border-color: var(--accent); color: var(--accent); }
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
@media (max-width: 860px) { .assistant-grid, .chat-composer, .field-row { grid-template-columns: minmax(0, 1fr); } }
</style>
