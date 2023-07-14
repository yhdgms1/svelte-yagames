<script context="module" lang="ts">
  import type { SDK, InitOptions, GetPlayerOptions } from './sdk';
  import type { Thenable } from './types';
  import type { Games } from './context';

  import { get_set } from './context';
  import { ExternalSDK, DataStorage as ExternalDataStorage, StatsStorage as ExternalStatsStorage, SHARED } from './external';

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
  /**
   * Ключ, по которому будут храниться игровые данные при отсутствии оффициального SDK Яндекса
   */
  type StorageKey = string;
  /**
   * Настройки хранилища, которое используется при отсутствии оффициального SDK Яндекса
   */
  type Storage = {
    key: StorageKey;
  };
</script>

<script lang="ts">
  type $$Props = {
    onBeforeLoaded?: OnBeforeLoaded;
    onGamesObject?: OnGamesObject;
    options?: Options;
    storage?: Storage;
  };

  export let onBeforeLoaded: OnBeforeLoaded = () => {};
  export let onGamesObject: OnGamesObject = () => {};
  export let options: Options = {
    init: {},
    player: { scopes: false }
  };
  export let storage: Storage = {
    key: 'game'
  }

  SHARED.key = storage.key;

  const set = get_set();

  const load = async () => {
    const isExternalSDK = !window.YaGames;

    /**
     * Получает либо настоящий SDK либо альтернативу
     */
    const sdk = isExternalSDK ? ExternalSDK : await window.YaGames.init(options.init);

    await onBeforeLoaded(sdk);

    try {
      var player = await sdk.getPlayer(options.player);
    } catch {
      /**
       * В случае ошибки при получении player используется fallback
       */
      var player = await ExternalSDK.getPlayer(options.player);
    }

    const authorized = player.getMode() !== 'lite';

    /**
     * При настоящем SDK - их хранилище, иначе `localStorage`
     */
    const YandexDataStorage = {
      get: async () => {
        try {
          return await player.getData()
        } catch {
          /**
           * В случае ошибки получения данных через getData используется localStorage
           */
          YandexDataStorage.get = ExternalDataStorage.get;
          YandexDataStorage.set = ExternalDataStorage.set;

          return await ExternalDataStorage.get();
        }
      },
      set: (data: unknown) => player.setData(data),
    };

    /**
     * При настоящем SDK - их хранилище, иначе `localStorage`
     */
    const YandexStatsStorage = {
      get: async () => {
        try {
          return await player.getStats()
        } catch {
          /**
           * В случае ошибки получения данных через getStats используется localStorage
           */
          YandexStatsStorage.get = ExternalStatsStorage.get;
          YandexStatsStorage.set = ExternalStatsStorage.set;

          return await ExternalStatsStorage.get();
        }
      },
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
