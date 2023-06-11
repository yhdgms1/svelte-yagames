import type { Action } from 'svelte/action';

const CSS = '-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;user-select:none;-khtml-user-select:none;touch-action:none';

/**
 * Запрещает перемещать картинку, долгое удержание по ней, и т.д.
 * 
 * @example ```svelte
 *  <img src={src} alt={alt} use:image={true} />
 * ```
 * @param node Картинка
 * @param styles Установить стили или нет
 */
const image: Action<HTMLImageElement, boolean> = (node, styles = true) => {
  node.setAttribute('draggable', 'false');

  if (styles) node.style.cssText += CSS;

  /**
   * Запрещает перетаскивать картинку
   */
  node.addEventListener('dragstart', (e) => (e.preventDefault(), false));

  /**
   * Запрещает открытие контекстного меню (долгое удержание на таче)
   */
  node.addEventListener('contextmenu', (e) => (e.preventDefault(), false));
}

export { image }