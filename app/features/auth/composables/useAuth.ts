import type { User } from '~/types/user'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const initialized = useState('auth-initialized', () => false)
  const api = useRequestFetch()
  async function load() {
    try {
      const response = await api<{ user: User }>('/api/v1/me')
      user.value = response.user
    } catch (error) {
      const status = (error as { status?: number; statusCode?: number }).status || (error as { statusCode?: number }).statusCode
      if (status !== 401) throw error
      user.value = null
    }
    initialized.value = true
    return user.value
  }
  async function login(email: string, password: string) {
    await $fetch('/api/v1/auth/login', { method: 'POST', body: { email, password } })
    await load()
    if (!user.value) throw new Error('Sesi belum tersedia. Silakan masuk kembali.')
  }
  async function logout() {
    await $fetch('/api/v1/auth/logout', { method: 'POST', body: {} })
    user.value = null
    initialized.value = true
    clearNuxtData()
    await navigateTo('/login')
  }
  return { user: readonly(user), initialized: readonly(initialized), load, login, logout }
}
