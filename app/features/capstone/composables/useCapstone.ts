import { useAuth } from '~/features/auth/composables/useAuth'
import { apiMessage } from '~/utils/format'

export const capstoneAPI = '/api/v1/capstone'

export function useCachedReference<T>(key: string, path: string) {
 const fetcher = useRequestFetch()
 return useLazyAsyncData<T>(key, () => fetcher<T>(capstoneAPI + path), {
  getCachedData: (k, nuxtApp) => nuxtApp.payload.data[k] ?? nuxtApp.static.data[k],
 })
}

export function useCapstone() {
 const auth = useAuth()
 const roles = computed(() => auth.user.value?.roles || [])
 const student = computed(() => roles.value.includes('MAHASISWA'))
 const coordinator = computed(() => roles.value.includes('KOORDINATOR_TA'))
 const staff = computed(() => roles.value.some(r => ['ADMIN', 'DOSEN', 'KOORDINATOR_TA', 'TU', 'KOPRODI'].includes(r)))
 const busy = shallowRef(false)
 const error = shallowRef('')
 const message = shallowRef('')
 async function mutate<T>(path: string, body: unknown, method: 'POST' | 'PUT' = 'POST'): Promise<T | null> {
  if (busy.value) return null
  busy.value = true; error.value = ''; message.value = ''
  try { const result = await $fetch<T>(capstoneAPI + path, { method, body: body as Record<string, unknown> }); message.value = 'Perubahan berhasil disimpan.'; return result ?? (true as T) }
  catch (e) { error.value = apiMessage(e); return null }
  finally { busy.value = false }
 }
 async function download(path: string, filename: string) {
  busy.value = true; error.value = ''
  try {
   const blob = await $fetch<Blob>(capstoneAPI + path, { responseType: 'blob' })
   const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) { error.value = apiMessage(e) }
  finally { busy.value = false }
 }
 return { user: auth.user, student, coordinator, staff, busy, error, message, mutate, download }
}
