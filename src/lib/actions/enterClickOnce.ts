import type { Action } from 'svelte/action';

/**
 * Запрещает вызов `on:click` на кнопке более одного раза, если зажата клавиша Enter
 * 
 * @example ```svelte
 * <button
 *  type="button"
 *  use:enterClickOnce
 *  on:click={() => $stats.score++}
 * >
 *  Увеличить счёт
 * </button> 
 * ```
 */
const enterClickOnce: Action<HTMLButtonElement> = (node) => {
  let pressed = false;
  
  const onkeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    
    if (!pressed) {
      return pressed = true
    } else {
      return e.preventDefault(), false;
    }
  }
  
  const onkeyup = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    
    pressed = false;
  }
  
  node.addEventListener('keydown', onkeydown);
  node.addEventListener('keyup', onkeyup);
  
  return {
    destroy() {
      node.removeEventListener('keydown', onkeydown);
      node.removeEventListener('keyup', onkeyup);
    }
  }
}

export { enterClickOnce }