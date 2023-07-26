<script context="module" lang="ts">
  import type { SDK, InitOptions, GetPlayerOptions } from './sdk';
  import type { Thenable, SavedData } from './types';
  import type { Games } from './context';

  import { get_set } from './context';
  import { ExternalSDK, DataStorage as ExternalDataStorage, StatsStorage as ExternalStatsStorage, SHARED } from './external';
  import { getNewest } from './utilities';

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
    respectExternalStore?: boolean;
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
  export let respectExternalStore = false;

  SHARED.key = storage.key;

  const set = get_set();

  const load = async () => {
    const isExternalSDK = !window.YaGames;

    /**
     * Получает либо настоящий SDK либо альтернативу
     */
    let sdk = isExternalSDK ? ExternalSDK : await window.YaGames.init(options.init);

    await onBeforeLoaded(sdk);

    try {
      var player = await sdk.getPlayer(options.player);
    } catch {
      /**
       * В случае ошибки при получении player используется fallback
       */
      var player = await ExternalSDK.getPlayer(options.player);
      /**
       * sdk также заменяем
       */
      sdk = ExternalSDK;
    }

    const authorized = player.getMode() !== 'lite';

    ExternalDataStorage.set = (data) => {
      if (!respectExternalStore) {
        return ExternalDataStorage.set(data);
      }

      return ExternalDataStorage.set({
        timestamp: Date.now(),
        data: data,
      });
    };

    /**
     * При настоящем SDK - их хранилище, иначе `localStorage`
     */
    const YandexDataStorage = {
      get: async () => {
        const external: SavedData = await ExternalDataStorage.get();

        try {
          const data: SavedData = await player.getData();

          if (!respectExternalStore) {
            return data;
          }

          return getNewest(data, external);
        } catch {
          /**
           * В случае ошибки получения данных через getData используется localStorage
           */
          YandexDataStorage.get = ExternalDataStorage.get;
          YandexDataStorage.set = ExternalDataStorage.set;

          return external;
        }
      },
      set: (data: unknown) => {
        if (!respectExternalStore) {
          return player.setData(data);
        }

        /**
         * Добавляется поле `timestamp` для проверки того, что новее
         */
        return player.setData({
          timestamp: Date.now(),
          data: data,
        });
      },
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
