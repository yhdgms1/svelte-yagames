import type { SDK, Player } from './sdk';

import { getContext, setContext } from 'svelte';

const key = Symbol();

interface Games {
  sdk: SDK;
  player: Player;
  authorized: boolean;
  data: {
    get: () => Promise<any>;
    set: (data: unknown) => Promise<unknown>;
  };
  stats: {
    get: () => Promise<Record<string, number>>;
    set: (data: Record<string, number>) => Promise<unknown>;
  };
}

const get = () => {
  return getContext<Games>(key);
}

const get_set = () => {
  const obj = {};

  setContext(key, obj);

  return (data: Games) => {
    Object.assign(obj, data);
  }
}

export { get, get_set }
export type { Games }