import { useAuth } from '~/features/auth/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  if (!user.value?.roles.includes('ADMIN')) return navigateTo('/account')
})
