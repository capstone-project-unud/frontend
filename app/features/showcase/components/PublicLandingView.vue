<script setup lang="ts">
import type { ShowcaseCategory, ShowcaseWork } from '../types'
import { MOCK_EXPO_WORKS } from '../data/mockExpoWorks'
import ShowcaseDetailDialog from './ShowcaseDetailDialog.vue'
import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceIcon from '~/components/workspace/WorkspaceIcon.vue'
import { useAuth } from '~/features/auth/composables/useAuth'

const auth = useAuth()
const theme = useTheme()

const { data: liveExpoData } = useFetch<{ items: ShowcaseWork[] }>('/api/v1/capstone/public/expo', {
  default: () => ({ items: [] }),
})

const publishedWorks = computed(() => liveExpoData.value?.items || [])
const usingLiveExpo = computed(() => publishedWorks.value.length > 0)
const catalogWorks = computed<ShowcaseWork[]>(() => (usingLiveExpo.value ? publishedWorks.value : MOCK_EXPO_WORKS))

onMounted(() => {
  if (!auth.initialized.value) {
    auth.load().catch(() => {})
  }
})

const searchQuery = ref('')
const selectedCategory = ref<'' | ShowcaseCategory>('')
const selectedInterest = ref('')
const selectedPeriod = ref('')
const selectedWork = ref<ShowcaseWork | null>(null)

const categoryOptions: { value: '' | ShowcaseCategory; label: string }[] = [
  { value: '', label: 'Semua Kategori' },
  { value: 'SOFTWARE', label: 'Software & Aplikasi' },
  { value: 'HARDWARE', label: 'Hardware & Produk Alat' },
  { value: 'ALGORITMA', label: 'Algoritma & Pemodelan' },
  { value: 'DOKUMEN_STRATEGIS', label: 'Dokumen Strategis & Simulasi' },
]

const INTEREST_CATALOG = [
  {
    code: '01',
    name: 'Data Sains dan Sistem Cerdas',
    description: 'Pengembangan visi komputer, pembelajaran mesin, analitik prediktif, serta sistem penalaran berbasis dokumen.',
  },
  {
    code: '02',
    name: 'IoT dan Jaringan',
    description: 'Perancangan simpul sensor terbenam, komunikasi nirkabel jarak jauh, komputasi tepi, dan keamanan trafik jaringan.',
  },
  {
    code: '03',
    name: 'Sistem Informasi',
    description: 'Rekayasa aplikasi terintegrasi, layanan digital publik, arsitektur mikroservis, dan keterandalan audit transaksi.',
  },
  {
    code: '04',
    name: 'Tata Kelola dan Bisnis Teknologi Informasi',
    description: 'Perencanaan arsitektur enterprise, asesmen kapabilitas tata kelola keamanan informasi, dan simulasi kepatuhan regulasi.',
  },
] as const

const CAPSTONE_STAGES = [
  {
    step: '01',
    title: 'Pembentukan Kelompok',
    detail: 'Mahasiswa membentuk tim, menetapkan ketua kelompok, dan merinci pembagian tanggung jawab teknis.',
  },
  {
    step: '02',
    title: 'Pengajuan Topik & Uji Kelayakan',
    detail: 'Pemilihan kategori luaran, penunjukan dua dosen pembimbing, dan verifikasi kompleksitas rancangan.',
  },
  {
    step: '03',
    title: 'Surat Tugas & Log Bimbingan',
    detail: 'Penerbitan surat tugas resmi serta pencatatan logbook kemajuan berkala bersama pembimbing.',
  },
  {
    step: '04',
    title: 'Dokumen Teknis Seri B',
    detail: 'Penyusunan spesifikasi teknis bertahap (B100 hingga B500 dan dokumen pendukung) secara terstruktur.',
  },
  {
    step: '05',
    title: 'Seminar Proposal & Revisi',
    detail: 'Evaluasi kelayakan rancangan bersama dewan penguji diikuti pencatatan dan validasi revisi.',
  },
  {
    step: '06',
    title: 'Sidang Akhir & Rubrik PA II',
    detail: 'Pemenuhan sebelas prasyarat kelayakan sidang, demonstrasi produk utuh, dan penilaian rubrik akhir.',
  },
  {
    step: '07',
    title: 'Capstone Expo & Galeri Publik',
    detail: 'Kurasi poster ilmiah X-Banner, video demonstrasi, repositori kode, dan publikasi terbuka untuk umum.',
  },
] as const

const interestOptions = computed(() => [
  { value: '', label: 'Semua Bidang Minat' },
  ...INTEREST_CATALOG.map(item => ({ value: item.name, label: item.name })),
])

const periodOptions = computed(() => {
  const uniquePeriods = Array.from(new Set(catalogWorks.value.map(w => w.academic_period_name))).sort().reverse()
  return [
    { value: '', label: 'Semua Periode' },
    ...uniquePeriods.map(period => ({ value: period, label: period })),
  ]
})

const filteredWorks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return catalogWorks.value.filter((work) => {
    if (selectedCategory.value && work.category !== selectedCategory.value) return false
    if (selectedInterest.value && work.interest_name !== selectedInterest.value) return false
    if (selectedPeriod.value && work.academic_period_name !== selectedPeriod.value) return false
    if (!q) return true
    const haystack = [
      work.title,
      work.group_code,
      work.category_label,
      work.interest_name,
      work.abstract_id,
      work.abstract_en,
      work.journal_title,
      ...work.supervisors,
      ...work.members.flatMap(m => [m.name, m.nim, m.responsibility]),
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })
})

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim() || selectedCategory.value || selectedInterest.value || selectedPeriod.value),
)

const interestCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const work of catalogWorks.value) {
    counts[work.interest_name] = (counts[work.interest_name] || 0) + 1
  }
  return counts
})

const featuredWork = computed(() => catalogWorks.value[0] || MOCK_EXPO_WORKS[0]!)

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedInterest.value = ''
  selectedPeriod.value = ''
}

function focusGalleryWithInterest(interestName: string) {
  selectedInterest.value = interestName
  const target = document.getElementById('galeri')
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div id="top" class="landing-shell">
    <header class="landing-topbar">
      <div class="landing-container topbar-inner">
        <NuxtLink to="/" class="brand-lockup" aria-label="Beranda Pameran Karya Capstone PSTI Unud">
          <span class="wordmark">capstone.</span>
          <span class="brand-sub">PSTI · Universitas Udayana</span>
        </NuxtLink>

        <nav class="topbar-nav" aria-label="Navigasi landing page">
          <a href="#galeri">Galeri Karya</a>
          <a href="#bidang">Bidang Minat</a>
          <a href="#alur">Alur Capstone</a>
        </nav>

        <div class="topbar-actions">
          <button
            type="button"
            class="button secondary theme-toggle"
            :aria-label="theme.isDark.value ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
            @click="theme.toggle()"
          >
            <WorkspaceIcon :name="theme.isDark.value ? 'sun' : 'moon'" />
            <span class="theme-label">{{ theme.isDark.value ? 'Mode terang' : 'Mode gelap' }}</span>
          </button>
          <NuxtLink class="button primary" :to="auth.user.value ? '/dashboard' : '/login'">
            {{ auth.user.value ? 'Buka Dashboard' : 'Masuk' }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="landing-main landing-container">
      <section class="hero-section" aria-labelledby="hero-heading">
        <div class="hero-copy">
          <span class="hero-kicker">Etalase Karya Mahasiswa</span>
          <h1 id="hero-heading">Pameran Karya Capstone Project PSTI Unud</h1>
          <p class="hero-lead muted">
            Ruang publikasi terbuka hasil <em>Computing Design Process</em> dalam memecahkan
            <em>Complex Computing Problems</em> oleh mahasiswa Program Studi Teknologi Informasi Universitas Udayana.
            Tamu, mitra industri, dan sivitas akademika dapat meninjau poster ilmiah, arsitektur sistem, serta luaran karya tanpa perlu masuk akun.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#galeri">Jelajahi Galeri Karya</a>
            <NuxtLink class="button secondary" :to="auth.user.value ? '/dashboard' : '/login'">
              {{ auth.user.value ? 'Buka Dashboard' : 'Masuk ke Ruang Kerja' }}
            </NuxtLink>
          </div>
        </div>

        <aside class="panel hero-featured" aria-label="Karya sorotan pameran">
          <div class="featured-header">
            <span class="featured-kicker">Karya Sorotan · {{ featuredWork.group_code }}</span>
            <span class="category-badge">{{ featuredWork.category_label }}</span>
          </div>
          <h2>{{ featuredWork.title }}</h2>
          <p class="interest-pill">{{ featuredWork.interest_name }} · {{ featuredWork.academic_period_name }}</p>

          <div class="featured-metrics">
            <div v-for="metric in featuredWork.poster.test_highlights.slice(0, 2)" :key="metric.label" class="featured-metric">
              <div class="featured-metric-head">
                <span class="muted">{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </div>
              <div class="metric-track" aria-hidden="true">
                <div class="metric-fill" :style="{ width: `${metric.score_pct}%` }" />
              </div>
            </div>
          </div>

          <div class="featured-meta">
            <div>
              <span class="muted">Ketua Kelompok</span>
              <strong>{{ featuredWork.members.find(m => m.is_leader)?.name }}</strong>
            </div>
            <div>
              <span class="muted">Pembimbing 1</span>
              <strong>{{ featuredWork.supervisors[0] }}</strong>
            </div>
          </div>

          <button type="button" class="button secondary featured-btn" @click="selectedWork = featuredWork">
            Lihat Poster &amp; Detail
          </button>
        </aside>
      </section>

      <section class="panel workspace-panel workspace-statistics-panel landing-stats" aria-label="Ringkasan statistik pameran">
        <dl class="workspace-statistics">
          <div class="workspace-stat">
            <dt>Bidang Minat PSTI</dt>
            <dd>4</dd>
          </div>
          <div class="workspace-stat">
            <dt>Kategori Luaran</dt>
            <dd>4</dd>
          </div>
          <div class="workspace-stat">
            <dt>{{ usingLiveExpo ? 'Karya Terpublikasi' : 'Karya Contoh (Pra-API)' }}</dt>
            <dd>{{ catalogWorks.length }}</dd>
          </div>
          <div class="workspace-stat">
            <dt>Akses Galeri Guest</dt>
            <dd>Terbuka</dd>
          </div>
        </dl>
      </section>

      <section id="galeri" class="gallery-section" aria-labelledby="gallery-heading">
        <div class="cap-section-heading gallery-heading">
          <div>
            <h2 id="gallery-heading">Galeri Pameran Karya Capstone</h2>
            <p class="muted">
              Contoh karya Capstone. Cari berdasarkan judul, mahasiswa, dosen, atau bidang minat.
            </p>
          </div>
        </div>

        <div class="panel filter-panel">
          <div class="workspace-toolbar landing-filters">
            <WorkspaceSearch
              id="landing-search"
              v-model="searchQuery"
              label="Cari karya capstone"
              placeholder="Cari judul, abstrak, nama mahasiswa, atau dosen..."
              @clear="searchQuery = ''"
            />
            <WorkspaceFilter
              id="filter-category"
              v-model="selectedCategory"
              label="Semua Kategori"
              :options="categoryOptions"
            />
            <WorkspaceFilter
              id="filter-interest"
              v-model="selectedInterest"
              label="Semua Bidang Minat"
              :options="interestOptions"
            />
            <WorkspaceFilter
              id="filter-period"
              v-model="selectedPeriod"
              label="Semua Periode"
              :options="periodOptions"
            />
          </div>
          <div class="filter-status-bar">
            <span class="muted">Menampilkan {{ filteredWorks.length }} dari {{ catalogWorks.length }} karya pameran</span>
            <button v-if="hasActiveFilters" type="button" class="workspace-text-action" @click="resetFilters">
              Reset Filter
            </button>
          </div>
        </div>

        <div v-if="filteredWorks.length > 0" class="expo-grid">
          <article v-for="work in filteredWorks" :key="work.id" class="panel expo-card">
            <div class="expo-card-top">
              <span class="category-badge">{{ work.category_label }}</span>
              <span class="meta-code muted">{{ work.group_code }} · {{ work.academic_period_name }}</span>
            </div>

            <p class="interest-pill">{{ work.interest_name }}</p>
            <h3 class="expo-title">{{ work.title }}</h3>
            <p class="expo-abstract muted">{{ work.abstract_id }}</p>

            <div class="team-box">
              <div class="team-box-head">
                <strong>Tim Mahasiswa ({{ work.members.length }} Anggota)</strong>
              </div>
              <ul class="member-list">
                <li v-for="member in work.members" :key="member.nim">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="muted member-nim">{{ member.nim }}</span>
                  <span v-if="member.is_leader" class="leader-badge">Ketua</span>
                </li>
              </ul>
              <p class="advisors-line muted">
                <strong>Pembimbing:</strong> {{ work.supervisors[0] }} · {{ work.supervisors[1] }}
              </p>
            </div>

            <div v-if="work.poster.test_highlights[0]" class="metric-highlight">
              <div class="metric-highlight-top">
                <span class="muted">{{ work.poster.test_highlights[0].label }}</span>
                <div class="metric-right">
                  <strong>{{ work.poster.test_highlights[0].value }}</strong>
                  <span class="journal-pill">{{ work.journal_class }}</span>
                </div>
              </div>
              <div class="metric-track" aria-hidden="true">
                <div class="metric-fill" :style="{ width: `${work.poster.test_highlights[0].score_pct}%` }" />
              </div>
            </div>

            <div class="expo-card-actions">
              <button type="button" class="button primary" @click="selectedWork = work">
                Detail &amp; Poster
              </button>
              <a v-if="work.repo_url" class="button secondary" :href="work.repo_url" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a v-if="work.video_url" class="button secondary" :href="work.video_url" target="_blank" rel="noopener noreferrer">
                Video
              </a>
            </div>
          </article>
        </div>

        <div v-else class="panel empty-state empty-state-box">
          <h3>Tidak ada karya yang cocok</h3>
          <p class="muted">
            Tidak ditemukan karya pameran dengan kata kunci atau filter yang dipilih. Atur ulang filter untuk menampilkan seluruh katalog contoh.
          </p>
          <button type="button" class="button primary" @click="resetFilters">Reset Filter</button>
        </div>
      </section>

      <section id="bidang" class="info-section" aria-labelledby="bidang-heading">
        <div class="cap-section-heading section-title-block">
          <div>
            <h2 id="bidang-heading">Bidang Minat PSTI Universitas Udayana</h2>
            <p class="muted">Pilih salah satu bidang minat untuk menyaring karya pada galeri pameran di atas.</p>
          </div>
        </div>

        <div class="interest-grid">
          <button
            v-for="item in INTEREST_CATALOG"
            :key="item.name"
            type="button"
            class="panel interest-card"
            :class="{ 'is-active': selectedInterest === item.name }"
            @click="focusGalleryWithInterest(item.name)"
          >
            <span class="card-index">{{ item.code }}</span>
            <h3>{{ item.name }}</h3>
            <p class="muted">{{ item.description }}</p>
            <span class="interest-count">{{ interestCounts[item.name] || 0 }} karya contoh · Lihat di galeri</span>
          </button>
        </div>
      </section>

      <section id="alur" class="info-section" aria-labelledby="alur-heading">
        <div class="cap-section-heading section-title-block">
          <div>
            <h2 id="alur-heading">Ringkasan Alur Capstone</h2>
            <p class="muted">Tahapan terstruktur dari pembentukan kelompok mahasiswa hingga publikasi karya pada pameran terbuka.</p>
          </div>
        </div>

        <div class="stages-grid">
          <article v-for="stage in CAPSTONE_STAGES" :key="stage.step" class="panel stage-card">
            <div class="stage-top">
              <span class="card-index">{{ stage.step }}</span>
            </div>
            <h3>{{ stage.title }}</h3>
            <p class="muted">{{ stage.detail }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="landing-container footer-inner">
        <p class="muted">Program Studi Teknologi Informasi · Fakultas Teknik · Universitas Udayana</p>
        <div class="footer-links">
          <a href="#galeri">Galeri Karya</a>
          <a href="#bidang">Bidang Minat</a>
          <a href="#alur">Alur Capstone</a>
          <NuxtLink :to="auth.user.value ? '/dashboard' : '/login'">
            {{ auth.user.value ? 'Dashboard' : 'Masuk' }}
          </NuxtLink>
        </div>
      </div>
    </footer>

    <ShowcaseDetailDialog :work="selectedWork" @close="selectedWork = null" />
  </div>
</template>

<style scoped>
.landing-shell {
  min-height: 100dvh;
  background: var(--canvas);
  color: var(--ink);
  display: flex;
  flex-direction: column;
}

.landing-container {
  width: min(1240px, 100%);
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 2rem);
}

.landing-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--canvas) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}

.topbar-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: .625rem;
}

.brand-lockup {
  display: inline-flex;
  align-items: baseline;
  gap: .65rem;
  text-decoration: none;
  color: var(--ink);
  min-height: 44px;
  align-items: center;
}

.wordmark {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.045em;
  color: var(--ink);
}

.brand-sub {
  font-size: .875rem;
  color: var(--muted);
  font-weight: 500;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.topbar-nav a {
  text-decoration: none;
  color: var(--muted);
  font-size: .9375rem;
  font-weight: 500;
  padding-block: .5rem;
  transition: color 150ms;
}

.topbar-nav a:hover {
  color: var(--ink);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: .625rem;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
}

.landing-main {
  flex: 1;
  display: grid;
  gap: clamp(2.5rem, 5vw, 4rem);
  padding-block: clamp(2rem, 4.5vw, 3.75rem) clamp(3rem, 6vw, 4.5rem);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, .95fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
}

.hero-copy {
  display: grid;
  gap: 1.25rem;
  justify-items: start;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  padding: .35rem .85rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--border));
  background: color-mix(in srgb, var(--accent) 10%, var(--panel));
  color: var(--accent);
  font-size: .8125rem;
  font-weight: 600;
  letter-spacing: .01em;
}

.hero-copy h1 {
  font-size: clamp(2rem, 4.2vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -.04em;
  line-height: 1.08;
  margin: 0;
}

.hero-lead {
  font-size: clamp(1rem, 1.35vw, 1.125rem);
  line-height: 1.65;
  max-width: 60ch;
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin-top: .25rem;
}

.hero-featured {
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  display: grid;
  gap: 1rem;
}

.featured-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  flex-wrap: wrap;
}

.featured-kicker {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--accent);
}

.hero-featured h2 {
  font-size: 1.1875rem;
  font-weight: 650;
  letter-spacing: -.02em;
  line-height: 1.35;
  margin: 0;
}

.featured-metrics {
  display: grid;
  gap: .75rem;
  padding: .9rem 1rem;
  border-radius: 12px;
  background: var(--canvas);
  border: 1px solid var(--line);
}

.featured-metric {
  display: grid;
  gap: .35rem;
}

.featured-metric-head {
  display: flex;
  justify-content: space-between;
  gap: .75rem;
  font-size: .875rem;
}

.featured-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
  padding-top: .75rem;
  border-top: 1px solid var(--line);
  font-size: .875rem;
}

.featured-meta span,
.featured-meta strong {
  display: block;
}

.featured-meta strong {
  margin-top: .2rem;
  font-weight: 600;
}

.featured-btn {
  width: 100%;
  justify-content: center;
}

.landing-stats {
  margin-bottom: 0;
}

.gallery-section,
.info-section {
  display: grid;
  gap: 1.25rem;
  scroll-margin-top: 88px;
}

.gallery-heading h2,
.section-title-block h2 {
  font-size: clamp(1.375rem, 2.4vw, 1.875rem);
  font-weight: 700;
  letter-spacing: -.03em;
  margin: 0;
}


.filter-panel {
  overflow: visible;
}

.landing-filters .workspace-search {
  flex: 1.4 1 280px;
  max-width: none;
}

.landing-filters .workspace-filter {
  flex: 1 1 190px;
  width: auto;
}

.filter-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: .65rem 1.5rem;
  border-top: 1px solid var(--line);
  font-size: .875rem;
}

.expo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
  gap: 1.25rem;
}

.expo-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .95rem;
  min-width: 0;
}

.expo-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  flex-wrap: wrap;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: .3rem .7rem;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 650;
  background: color-mix(in srgb, var(--accent) 14%, var(--canvas));
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
}

.meta-code {
  font-size: .8125rem;
  font-weight: 500;
}

.interest-pill {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--sage);
  margin: 0;
}

.expo-title {
  font-size: 1.125rem;
  font-weight: 650;
  letter-spacing: -.02em;
  line-height: 1.38;
  margin: 0;
  overflow-wrap: anywhere;
}

.expo-abstract {
  font-size: .9375rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.team-box {
  padding: .9rem 1rem;
  border-radius: 12px;
  background: var(--canvas);
  border: 1px solid var(--line);
  display: grid;
  gap: .55rem;
}

.team-box-head {
  font-size: .8125rem;
  color: var(--ink);
}

.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: .35rem;
}

.member-list li {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .4rem;
  font-size: .84rem;
}

.member-name {
  font-weight: 500;
}

.member-nim {
  font-size: .8rem;
}

.leader-badge {
  padding: .12rem .5rem;
  border-radius: 999px;
  font-size: .74rem;
  font-weight: 650;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent);
}

.advisors-line {
  margin: .15rem 0 0;
  padding-top: .5rem;
  border-top: 1px solid var(--line);
  font-size: .8125rem;
  line-height: 1.45;
}

.metric-highlight {
  display: grid;
  gap: .4rem;
  margin-top: auto;
}

.metric-highlight-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .65rem;
  font-size: .84rem;
  flex-wrap: wrap;
}

.metric-right {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
}

.journal-pill {
  padding: .15rem .55rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--canvas);
  color: var(--ink);
}

.metric-track {
  height: 7px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
}

.expo-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding-top: .65rem;
  border-top: 1px solid var(--line);
}

.empty-state-box {
  padding: 3rem 1.5rem;
  text-align: center;
  display: grid;
  gap: .75rem;
  justify-items: center;
}

.empty-state-box h3,
.empty-state-box p {
  margin: 0;
  max-width: 48ch;
}

.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: 1rem;
}

.interest-card {
  padding: 1.35rem;
  text-align: left;
  display: grid;
  gap: .65rem;
  align-content: start;
  color: var(--ink);
  cursor: pointer;
  transition: border-color 150ms, background-color 150ms, transform 150ms;
}

.interest-card:hover {
  background: var(--panel-hover);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.interest-card.is-active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--panel));
}

.card-index {
  font-size: .8125rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: .04em;
}

.interest-card h3,
.stage-card h3 {
  font-size: 1.0625rem;
  font-weight: 650;
  margin: 0;
  line-height: 1.35;
}

.interest-card p,
.stage-card p {
  font-size: .9rem;
  line-height: 1.55;
  margin: 0;
}

.interest-count {
  margin-top: auto;
  padding-top: .5rem;
  font-size: .8125rem;
  font-weight: 600;
  color: var(--accent);
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 1rem;
}

.stage-card {
  padding: 1.25rem;
  display: grid;
  gap: .55rem;
  align-content: start;
}

.stage-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}


.landing-footer {
  border-top: 1px solid var(--line);
  background: var(--panel);
}

.footer-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: 1rem;
  font-size: .875rem;
}

.footer-inner p {
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: none;
  color: var(--muted);
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--ink);
}

@media (max-width: 960px) {
  .hero-section {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .workspace-stat {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 720px) {
  .topbar-nav {
    display: none;
  }

  .brand-sub {
    display: none;
  }

  .theme-label {
    display: none;
  }

  .featured-meta {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 540px) {
  .workspace-statistics {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
