import { useAuth } from '~/features/auth/composables/useAuth'
export default defineNuxtRouteMiddleware((to) => {
 const expected = to.meta.roles
 if (Array.isArray(expected) && !useAuth().user.value?.roles.some(role => expected.includes(role))) return navigateTo('/capstone')
})
