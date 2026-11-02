import { useAuth } from '~/features/auth/composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth()
  if (!auth.initialized.value) await auth.load()
  if (!auth.user.value) return navigateTo('/login')
})
