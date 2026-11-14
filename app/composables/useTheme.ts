export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = useState<Theme>('app-theme', () => 'system')
  const isDark = useState<boolean>('is-dark-theme', () => false)

  function applyTheme(target: Theme) {
    theme.value = target
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('capstone_theme', target)
    } catch {
      // Ignore storage restrictions
    }

    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedDark = target === 'dark' || (target === 'system' && isSystemDark)

    isDark.value = resolvedDark
    if (resolvedDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  function toggle() {
    applyTheme(isDark.value ? 'light' : 'dark')
  }

  onMounted(() => {
    let saved: Theme | null = null
    try {
      saved = localStorage.getItem('capstone_theme') as Theme | null
    } catch {
      saved = null
    }
    applyTheme(saved || 'system')

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handler)
  })

  return {
    theme,
    isDark,
    toggle,
    applyTheme,
  }
}

