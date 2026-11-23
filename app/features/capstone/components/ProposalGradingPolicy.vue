<script setup lang="ts">
import { CPMK_RUBRIC } from '../types'
import { panelLabels, type PublishedPolicy } from '../proposal'
import { useCapstone } from '../composables/useCapstone'
const props = defineProps<{ policy: PublishedPolicy | null }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const name = shallowRef('')
const indicators = CPMK_RUBRIC.flatMap<{ code: string; label: string }>(g => [...g.items])
const weights = reactive<Record<string, number | ''>>(Object.fromEntries(indicators.map(i => [i.code, props.policy?.rules.indicator_weights[i.code] ?? ''])))
const panelWeights = reactive<Record<string, number | ''>>(Object.fromEntries(Object.keys(panelLabels).map(k => [k, props.policy?.rules.panel_weights[k] ?? ''])))
const bands = ref<{ minimum: number | ''; letter: string }[]>(props.policy?.rules.letter_bands.map(b => ({ ...b })) || [{ minimum: '', letter: '' }, { minimum: 0, letter: '' }])
const confirm = shallowRef(false)
const indicatorTotal = computed(() => Object.values(weights).reduce<number>((sum, v) => sum + Number(v), 0))
const panelTotal = computed(() => Object.values(panelWeights).reduce<number>((sum, v) => sum + Number(v), 0))
function applyDefaultPreset() {
 if (!name.value.trim()) name.value = 'Kebijakan Penilaian Sempro PSTI Unud'
 for (const i of indicators) weights[i.code] = 6.25
 panelWeights.SUPERVISOR_1 = 30
 panelWeights.SUPERVISOR_2 = 20
 panelWeights.EXAMINER_1 = 20
 panelWeights.EXAMINER_2 = 20
 panelWeights.EXAMINER_3 = 10
 bands.value = [{ minimum: 80, letter: 'A' }, { minimum: 65, letter: 'B' }, { minimum: 0, letter: 'C' }]
}
async function save() {
 if (!confirm.value) return
 if (await api.mutate('/proposal-grading-policy', { name: name.value, indicator_weights: weights, panel_weights: panelWeights, letter_bands: bands.value })) emit('saved')
}
</script>
<template>
 <details class="panel cap-section"><summary>Aturan perhitungan nilai proposal{{ policy ? ' · ' + policy.name : ' · Belum ditetapkan' }}</summary>
  <p class="muted">Perubahan bobot dan konversi huruf berlaku untuk ujian yang belum mulai dinilai.</p>
  <div class="cap-actions"><button type="button" class="button secondary" :disabled="busy" @click="applyDefaultPreset">Isi contoh bobot merata</button></div>
  <form class="cap-section" @submit.prevent="save"><fieldset class="cap-fieldset" :disabled="busy">
   <div class="field"><label for="policy-name">Nama dan versi aturan</label><input id="policy-name" v-model="name" required minlength="3" maxlength="150" placeholder="Nama keputusan atau periode penilaian"></div>
   <h3>Bobot indikator · {{ indicatorTotal }} / 100%</h3><div class="field-grid"><div v-for="i in indicators" :key="i.code" class="field"><label :for="'weight-' + i.code">{{ i.code }} · {{ i.label }}</label><input :id="'weight-' + i.code" v-model.number="weights[i.code]" type="number" required min="0.0001" max="100" step="0.0001" inputmode="decimal"></div></div>
   <h3>Bobot penilai · {{ panelTotal }} / 100%</h3><div class="field-grid"><div v-for="(label, role) in panelLabels" :key="role" class="field"><label :for="'panel-weight-' + role">{{ label }}</label><input :id="'panel-weight-' + role" v-model.number="panelWeights[role]" type="number" required min="0.0001" max="100" step="0.0001" inputmode="decimal"></div></div>
   <h3>Konversi nilai huruf</h3><p class="muted">Urutkan batas bawah dari tertinggi hingga 0. Nilai pada batas masuk ke huruf tersebut.</p>
   <div v-for="(band, i) in bands" :key="i" class="field-grid"><div class="field"><label :for="'band-min-' + i">Batas bawah {{ i + 1 }}</label><input :id="'band-min-' + i" v-model.number="band.minimum" type="number" required min="0" max="100" step="0.01"></div><div class="field"><label :for="'band-letter-' + i">Huruf {{ i + 1 }}</label><input :id="'band-letter-' + i" v-model="band.letter" required maxlength="5"></div><div class="cap-actions"><button type="button" class="button secondary" :disabled="bands.length <= 2" @click="bands.splice(i, 1)">Hapus batas {{ i + 1 }}</button></div></div>
   <div><button type="button" class="button secondary" :disabled="bands.length >= 10" @click="bands.push({ minimum: '', letter: '' })">Tambah batas huruf</button></div>
   <label class="check-field"><input v-model="confirm" type="checkbox" required> Bobot dan konversi ini telah disetujui program studi.</label>
  </fieldset><p v-if="error" class="notice error" role="alert">{{ error }}</p><div><button class="button primary" :disabled="busy || !confirm || Math.abs(indicatorTotal - 100) > 0.00001 || Math.abs(panelTotal - 100) > 0.00001">{{ busy ? 'Menerbitkan…' : 'Terbitkan versi aturan' }}</button></div></form>
 </details>
</template>
