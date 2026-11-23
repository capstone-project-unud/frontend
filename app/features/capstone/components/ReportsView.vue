<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import { capstoneAPI, useCachedReference, useCapstone } from '../composables/useCapstone'
import type { AcademicPeriod, Interest, MonitoringReport } from '../types'

const api = useCapstone()
const { busy, error } = api
const fetcher = useRequestFetch()

const reportType = shallowRef<'progress' | 'guidance' | 'outcomes'>('progress')
const periodId = shallowRef('')
const interestId = shallowRef('')
const statusFilter = shallowRef('')

const { data: periods } = await useCachedReference<{ items: AcademicPeriod[] }>('master-periods', '/master/periods')
const { data: interests } = await useCachedReference<{ items: Interest[] }>('capstone-interests', '/interests')

const { data, status, error: loadError, refresh } = await useLazyAsyncData(
  'monitoring-report',
  () => fetcher<MonitoringReport>(capstoneAPI + '/monitoring/report', {
    query: { type: reportType.value, period_id: periodId.value, interest_id: interestId.value, status: statusFilter.value },
  }),
  { watch: [reportType, periodId, interestId, statusFilter] },
)

const typeOptions = [
  { value: 'progress', label: '1. Laporan Kemajuan Proyek' },
  { value: 'guidance', label: '2. Laporan Aktivitas Bimbingan' },
  { value: 'outcomes', label: '3. Laporan Hasil Ujian & Publikasi' },
]
const periodOptions = computed(() => [{ value: '', label: 'Semua periode' }, ...(periods.value?.items || []).map(p => ({ value: p.id, label: p.name }))])
const interestOptions = computed(() => [{ value: '', label: 'Semua bidang minat' }, ...(interests.value?.items || []).map(i => ({ value: i.id, label: i.name }))])

function exportReport(format: 'xlsx' | 'pdf') {
  const params = new URLSearchParams({
    type: reportType.value,
    format,
    period_id: periodId.value,
    interest_id: interestId.value,
    status: statusFilter.value,
  })
  return api.download(`/monitoring/export?${params}`, `Laporan_${reportType.value}.${format}`)
}
</script>

<template>
  <section>
    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Monitoring &amp; pelaporan resmi</h2>
          <span v-if="data">{{ data.empty ? 'Tidak ada data' : `${data.rows.length} baris` }}</span>
        </div>
        <div class="workspace-panel-actions">
          <button type="button" class="button secondary" :disabled="busy || !data || data.empty" @click="exportReport('xlsx')">Ekspor Excel (.xlsx)</button>
          <button type="button" class="button secondary" :disabled="busy || !data || data.empty" @click="exportReport('pdf')">Ekspor PDF</button>
        </div>
      </div>

      <div class="workspace-toolbar">
        <WorkspaceFilter id="rep-type" v-model="reportType" label="Jenis laporan" :options="typeOptions" />
        <WorkspaceFilter id="rep-period" v-model="periodId" label="Periode akademik" :options="periodOptions" />
        <WorkspaceFilter id="rep-interest" v-model="interestId" label="Bidang minat" :options="interestOptions" />
        <button v-if="periodId || interestId || statusFilter" type="button" class="workspace-text-action secondary" @click="periodId = ''; interestId = ''; statusFilter = ''">Reset filter</button>
      </div>

      <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
      <WorkspaceSkeleton v-if="status === 'pending'" variant="table" :rows="5" label="Menyiapkan rekap laporan…" />
      <div v-else-if="loadError" class="empty-state">
        <h2>Laporan belum dapat dimuat</h2>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!data || data.empty" class="empty-state">
        <h2>Tidak ada data pada filter yang dipilih</h2>
      </div>
      <div v-else class="workspace-table cap-table-wrap" tabindex="0">
        <table class="workspace-table cap-table">
          <thead>
            <tr>
              <th v-for="col in data.headers" :key="col" scope="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in data.rows" :key="rIdx">
              <td v-for="(cell, cIdx) in row" :key="cIdx">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
