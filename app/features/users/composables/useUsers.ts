import type { User, UserInput, UserList, UserStats, Role } from '~/types/user'
import { apiMessage } from '~/utils/format'

export function useUsers() {
  const query = shallowRef('')
  const role = shallowRef<Role | ''>('')
  const status = shallowRef('')
  const page = shallowRef(1)
  const api = useRequestFetch()
  const params = computed(() => ({ q: query.value, role: role.value, status: status.value, page: page.value }))
  const list = useAsyncData('user-list', () => api<UserList>('/api/v1/users', { query: params.value }), { watch: [params] })
  const stats = useAsyncData('user-stats', () => api<UserStats>('/api/v1/users/stats'))
  const saving = shallowRef(false)
  const mutationError = shallowRef('')
  const message = shallowRef('')
  async function refresh() { await Promise.all([list.refresh(), stats.refresh()]) }
  async function save(input: UserInput, user: User | null) {
    if (saving.value) return false
    saving.value = true
    mutationError.value = ''
    message.value = ''
    try {
      await $fetch(user ? `/api/v1/users/${user.id}` : '/api/v1/users', { method: user ? 'PUT' : 'POST', body: input })
      message.value = user ? 'Perubahan pengguna berhasil disimpan.' : 'Akun pengguna berhasil dibuat. Sampaikan kata sandi awal secara pribadi kepada pemilik akun.'
      await refresh()
      return true
    } catch (e) { mutationError.value = apiMessage(e); return false }
    finally { saving.value = false }
  }
  async function setStatus(user: User) {
    if (saving.value) return false
    saving.value = true
    mutationError.value = ''
    message.value = ''
    try {
      await $fetch(`/api/v1/users/${user.id}/status`, { method: 'PATCH', body: { is_active: !user.is_active } })
      message.value = `Akun ${user.full_name} berhasil ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`
      await refresh()
      return true
    } catch (e) { mutationError.value = apiMessage(e); return false }
    finally { saving.value = false }
  }
  function filters(next: { q: string; role: Role | ''; status: string }) {
    query.value = next.q
    role.value = next.role
    status.value = next.status
    page.value = 1
  }
  async function resetPassword(user: User, password: string) {
    if (saving.value) return false
    saving.value = true
    mutationError.value = ''
    try {
      await $fetch(`/api/v1/users/${user.id}/password`, { method: 'PUT', body: { password } })
      message.value = `Kata sandi ${user.full_name} telah diatur ulang. Sampaikan kata sandi baru secara pribadi.`
      return true
    } catch (error) { mutationError.value = apiMessage(error); return false }
    finally { saving.value = false }
  }
  return { list, stats, params, page, saving, mutationError, message, filters, save, setStatus, resetPassword, refresh }
}
