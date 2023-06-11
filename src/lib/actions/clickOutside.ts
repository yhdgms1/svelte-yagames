import type { Action } from 'svelte/action';

/**
 * Клик вне элемента
 */
const clickOutside: Action<HTMLElement, () => void> = (node, handler) => {
  const handleClick = (event: MouseEvent) =>
    node &&
    !node.contains(event.target as HTMLElement) &&
    !event.defaultPrevented &&
    handler &&
    handler()

  document.addEventListener('click', handleClick, true)

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}

export { clickOutside }