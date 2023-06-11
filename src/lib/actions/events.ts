import type { Action } from 'svelte/action';
import { bubble, listen, get_current_component } from 'svelte/internal';

/**
 * Позволяет передавать слушатели событий в компоненты без необходимости явно объявлять их
 * 
 * @example ```svelte
 * <script>
 *  const events = getEventAction();
 * </script>
 * 
 * <button
 *  use:events
 * >
 *  <slot />
 * </button>
 * ```
 * @author AlexxNB
 * @source https://github.com/AlexxNB/svelte-chota/blob/master/cmp/utils.js
 */
const getEventsAction = () => {
  const component = get_current_component();

  const action: Action = node => {
    const events = Object.keys(component.$$.callbacks);
    const listeners: (() => void)[] = [];

    for (const event of events) {
      listeners.push(listen(node, event, function (event) { bubble.call(this, component, event) }));
    }

    return {
      destroy: () => {
        for (const lisneter of listeners) {
          lisneter();
        }
      }
    }
  };

  return action;
}

export { getEventsAction }