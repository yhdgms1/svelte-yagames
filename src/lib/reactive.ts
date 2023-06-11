import type { Games } from './context';
import type { Writable, Unsubscriber } from 'svelte/store';

import { writable } from 'svelte/store';
import { throttle, isEmpty } from './utilities';

/**
 * Функция для автоматической синхронизации сторов и их данных на сервере
 * @param param0 Начальные данные
 */
const createReactive = <D extends Record<any, any>, S extends Record<string, number>>({ data, stats }: { data: D, stats: S }) => {
  /**
   * Если нет ни 'data' ни 'stats', то скорее всего 'createReactive' используется неправильно
   */
  if (isEmpty(data) && isEmpty(stats)) {
    throw new Error(`'data' and 'stats' could not be both empty, provide initial value or do not use 'createReactive'`)
  };

  const data$ = writable(data);
  const stats$ = writable(stats);

  const unsubscribers = new Set<Unsubscriber>();

  const init = async (games: Games) => {
    const [_data, _stats] = await Promise.all([
      /**
       * Если начальные 'data' или 'stats', которые также используются дли типизации, пусты, то скорее всего в игре они не используются
       * 
       * Например, используются статы, но не данные.
       */
      isEmpty(data) ? Promise.resolve({}) : games.data.get(),
      isEmpty(stats) ? Promise.resolve({}) : games.stats.get()
    ]);

    /**
     * Если загруженные данные не пустой объект, значит, некоторые данные уже были сохранены
     */
    const check = (obj: Record<any, any>, store: Writable<Record<any, any>>) => {
      /**
       * И тогда они устанавливаются в стор
       */
      if (!isEmpty(obj)) store.set(obj);
    }

    check(_data, data$);
    check(_stats, stats$);

    const sub = (store: Writable<Record<any, any>>, method: "data" | "stats") => {
      let as_string = '';

      const throttled = throttle((data: Record<any, any>) => {
        const stringified = JSON.stringify(data);

        /**
         * Если данные одинаковые, то нельзя их посылать ещё раз
         */
        if (as_string === stringified) return;

        /**
         * Обновляем переменную
         */
        as_string = stringified;

        /**
         * Реализация `throttle` не поддерживает async-await, поэтому не дожидаемся окончания загрузки
         */
        games[method].set(data);
      }, 750);

      return store.subscribe(throttled);
    }

    unsubscribers.add(sub(data$, 'data'));
    unsubscribers.add(sub(stats$, 'stats'));
  }

  const cleanup = () => {
    unsubscribers.forEach(unsub => unsub());
    unsubscribers.clear()
  }

  return {
    init,
    cleanup,
    data: data$,
    stats: stats$
  }
}

export { createReactive }