import type { CSSProperties, Ref } from 'vue'

export function useWorkspacePopover(trigger: Readonly<Ref<HTMLElement | null>>, panel: Readonly<Ref<HTMLElement | null>>, minimumWidth = 260, maximumHeight = 360) {
  const open = shallowRef(false)
  const placement = shallowRef<CSSProperties>({})

  function position() {
    if (!trigger.value || !panel.value) return
    const rect = trigger.value.getBoundingClientRect()
    const width = Math.min(Math.max(rect.width, minimumWidth), window.innerWidth - 24)
    const below = window.innerHeight - rect.bottom - 18
    const above = rect.top - 18
    const useAbove = below < maximumHeight && above > below
    const maxHeight = Math.max(80, Math.min(maximumHeight, useAbove ? above : below))
    const height = Math.min(panel.value.scrollHeight || maxHeight, maxHeight)
    placement.value = {
      width: `${width}px`, maxHeight: `${maxHeight}px`,
      left: `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`,
      top: `${Math.max(12, useAbove ? rect.top - height - 6 : rect.bottom + 6)}px`,
    }
  }

  async function show() {
    if (!trigger.value || trigger.value.matches(':disabled')) return false
    position()
    panel.value?.showPopover()
    open.value = true
    await nextTick()
    position()
    return true
  }

  function close(restoreFocus = false) {
    if (panel.value?.matches(':popover-open')) panel.value.hidePopover()
    open.value = false
    if (restoreFocus) trigger.value?.focus()
  }

  function sync(event: Event) {
    open.value = (event as ToggleEvent).newState === 'open'
  }

  function reposition(event: Event) {
    if (open.value && !(event.target instanceof Node && panel.value?.contains(event.target))) position()
  }

  onMounted(() => {
    window.addEventListener('resize', reposition)
    document.addEventListener('scroll', reposition, true)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', reposition)
    document.removeEventListener('scroll', reposition, true)
  })
  return { open, placement, show, close, sync }
}
