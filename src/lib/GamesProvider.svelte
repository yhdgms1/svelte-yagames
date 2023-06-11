<script context="module" lang="ts">
  import type { SDK, InitOptions, GetPlayerOptions } from './sdk';
  import type { Thenable } from './types';
  import type { Games } from './context';

  import { get_set } from './context';
  import { ExternalSDK, DataStorage as ExternalDataStorage, StatsStorage as ExternalStatsStorage } from './external';

  type OnBeforeLoaded = (sdk: SDK) => Thenable<void>;
  type OnGamesObject = (games: Games) => Thenable<void>;
  type Options = {
    /**
     * Настройки `YaGames.init()`
     */
    init: InitOptions,
    /**
     * Настройки `sdk.getPlayer()`
     */
    player: GetPlayerOptions
  };
</script>

<script lang="ts">
  type $$Props = {
    onBeforeLoaded?: OnBeforeLoaded;
    onGamesObject?: OnGamesObject;
    options?: Options;
  };

  export let onBeforeLoaded: OnBeforeLoaded = () => {};
  export let onGamesObject: OnGamesObject = () => {};
  export let options: Options = {
    init: {},
    player: { scopes: false }
  };

  const set = get_set();

  const load = async () => {
    const isExternalSDK = !window.YaGames;

    /**
     * Получает либо настоящий SDK либо альтернативу
     */
    const sdk = isExternalSDK ? ExternalSDK : await window.YaGames.init(options.init);

    await onBeforeLoaded(sdk);

    const player = await sdk.getPlayer(options.player);

    const authorized = player.getMode() !== 'lite';

    /**
     * При настоящем SDK - их хранилище, иначе `localStorage`
     */
    const YandexDataStorage = {
      get: () => player.getData(),
      set: (data: unknown) => player.setData(data),
    };

    /**
     * При настоящем SDK - их хранилище, иначе `localStorage`
     */
    const YandexStatsStorage = {
      get: () => player.getStats(),
      set: (data: Record<string, number>) => player.setStats(data)
    }

    const DataStorage: typeof YandexDataStorage = authorized ? YandexDataStorage : ExternalDataStorage;
    const StatsStorage: typeof YandexStatsStorage = authorized ? YandexStatsStorage : ExternalStatsStorage;

    /**
     * Объект `games`, который удобнее использовать, чем стандартные методы sdk
     */
    const games = { sdk, player, authorized, data: DataStorage, stats: StatsStorage };

    set(games);

    await onGamesObject(games);

    sdk.features.LoadingAPI?.ready?.();
  };
</script>

{#await load()}
	<slot name="loading" />
{:then}
	<slot />
{:catch error}
	<slot name="error" {error} />
{/await}
