<script setup lang="ts">
import FileUpload from './FileUpload.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { RevisionItem } from '../types'

const props = defineProps<{
  stage: 'SEMPRO' | 'FINAL_EXAM'
  seminarId: string
  projectId: string
  seminarVersion: number
  approvedFileId?: string | null
  items: RevisionItem[]
  isExaminer: boolean
  endorseEndpoint?: string
}>()

const emit = defineEmits<{ changed: [] }>()
const api = useCapstone()
const { student, coordinator, busy } = api

const newNote = shallowRef('')
const responses = reactive<Record<string, { text: string; fileId: string | null }>>({})
const reviewNotes = reactive<Record<string, string>>({})
const endorsedFileId = shallowRef<string | null>(props.approvedFileId || null)

watch(() => props.approvedFileId, (val) => {
  endorsedFileId.value = val || null
})

watch(() => props.items, (list) => {
  for (const it of list) {
    if (!responses[it.id]) {
      responses[it.id] = { text: it.student_response || '', fileId: it.response_file_id || null }
    }
  }
}, { immediate: true })

async function addItem() {
  if (!newNote.value.trim()) return
  if (await api.mutate('/revisions', {
    stage: props.stage,
    seminar_id: props.seminarId,
    project_id: props.projectId,
    note: newNote.value,
  })) {
    newNote.value = ''
    emit('changed')
  }
}

async function respond(it: RevisionItem) {
  const r = responses[it.id]
  if (!r) return
  if (await api.mutate(`/revisions/${it.id}/respond`, {
    student_response: r.text,
    response_file_id: r.fileId,
    version: it.version,
  }, 'PUT')) emit('changed')
}

async function review(it: RevisionItem, status: 'APPROVED' | 'REVISION') {
  if (await api.mutate(`/revisions/${it.id}/review`, {
    status,
    reviewer_note: reviewNotes[it.id] || '',
    version: it.version,
  }, 'PUT')) {
    reviewNotes[it.id] = ''
    emit('changed')
  }
}

async function endorseSheet() {
  if (!endorsedFileId.value) return
  const base = props.endorseEndpoint || (props.stage === 'SEMPRO' ? `/sempro/${props.seminarId}/revision-approval` : `/final-exam/${props.seminarId}/revision-approval`)
  if (await api.mutate(base, { file_id: endorsedFileId.value, version: props.seminarVersion })) emit('changed')
}

const allApproved = computed(() => props.items.length > 0 && props.items.every(i => i.status === 'APPROVED'))
</script>

<template>
  <div class="rev-tracker">
    <div class="cap-section-heading">
      <h4>Poin revisi penguji · {{ items.length }} catatan</h4>
      <a v-if="approvedFileId" class="workspace-text-action" :href="`${capstoneAPI}/files/${approvedFileId}`">Unduh pengesahan revisi (PDF)</a>
    </div>

    <form v-if="isExaminer || coordinator" class="cap-review" @submit.prevent="addItem">
      <div class="field">
        <label :for="'add-rev-' + seminarId">Tambah catatan revisi spesifik penguji</label>
        <textarea :id="'add-rev-' + seminarId" v-model="newNote" rows="2" required minlength="5" maxlength="2000" placeholder="Contoh: Perbaiki diagram blok arsitektur dan lengkapi uji skenario B pada Bab IV." />
      </div>
      <div class="cap-actions">
        <button class="button secondary" :disabled="busy">Tambah poin revisi</button>
      </div>
    </form>

    <ul v-if="items.length" class="rev-list">
      <li v-for="it in items" :key="it.id" class="rev-item">
        <div class="cap-section-heading">
          <div>
            <strong>{{ it.examiner_name }}</strong>
            <p class="cap-preserve">{{ it.note }}</p>
          </div>
          <StatusLabel :value="it.status" />
        </div>
        <p v-if="it.student_response" class="muted">Tanggapan mahasiswa: {{ it.student_response }}</p>
        <div v-if="it.response_file_id" class="cap-actions">
          <a class="workspace-text-action" :href="`${capstoneAPI}/files/${it.response_file_id}`">Lihat berkas revisi tanggapan</a>
        </div>
        <p v-if="it.reviewer_note" class="notice">Catatan pemeriksa: {{ it.reviewer_note }}</p>

        <form v-if="student && it.status !== 'APPROVED'" class="cap-review" @submit.prevent="respond(it)">
          <div class="field">
            <label :for="'resp-text-' + it.id">Tanggapan perbaikan</label>
            <textarea :id="'resp-text-' + it.id" v-model="responses[it.id]!.text" rows="2" required minlength="5" maxlength="2000" />
          </div>
          <FileUpload v-model="responses[it.id]!.fileId" label="Lampiran bukti perbaikan PDF (opsional)" />
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Kirim tanggapan revisi</button>
          </div>
        </form>

        <form v-if="(isExaminer || coordinator) && it.status !== 'APPROVED'" class="cap-review" @submit.prevent="review(it, 'APPROVED')">
          <div class="field">
            <label :for="'rev-note-' + it.id">Catatan persetujuan / koreksi</label>
            <input :id="'rev-note-' + it.id" v-model="reviewNotes[it.id]" maxlength="2000" placeholder="Wajib diisi saat meminta perbaikan ulang">
          </div>
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Setujui poin revisi</button>
            <button type="button" class="button secondary" :disabled="busy" @click="review(it, 'REVISION')">Minta perbaiki ulang</button>
          </div>
        </form>
      </li>
    </ul>

    <form v-if="(coordinator || student) && allApproved && !approvedFileId" class="cap-review" @submit.prevent="endorseSheet">
      <h4>Unggah Lembar Pengesahan Revisi bertanda tangan seluruh penguji</h4>
      <FileUpload v-model="endorsedFileId" label="Lembar Pengesahan Revisi (PDF)" />
      <div class="cap-actions">
        <button class="button primary" :disabled="busy || !endorsedFileId">Simpan pengesahan revisi</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.rev-tracker { display: grid; gap: .875rem; border-top: 1px solid var(--line); padding-top: 1rem; }
.rev-list { list-style: none; padding: 0; margin: 0; display: grid; gap: .75rem; }
.rev-item { padding: 1rem; border: 1px solid var(--border); border-radius: 12px; background: var(--canvas); display: grid; gap: .6rem; }
</style>
