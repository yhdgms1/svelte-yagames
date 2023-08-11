# svelte-yagames

Пакет для более удобной работы с Yandex Games из Svelte.

## GamesProvider

GamesProvider представляет собой компонент, который занимается инициализацией SDK. Также он получает объект игрока и настраивает хранилище. В случае отсутствия `YaGames` в глобальном объекте `window`, что значит, что игра запущена вне платформы Яндекс Игр используется «запасной вариант» SDK, при котором сохранение данных происходит в `localStorage`. SDK сохраняется в контекст и может быть получен функцией `useGames()`. Помимо этого в `GamesProvider` можно передать функцию обратного вызова `onBeforeLoaded` — вызывается после вызова `YaGames.init()` и передаёт объект SDK в качестве параметра, и `onGamesObject` — вызывается в самый последний момент, и завершает процесс загрузки.
Кроме того, пропсами `options` и `storage` можно настроить аргументы, передаваемые в `YaGames.init` и в `SDK.getPlayer`.

```svelte
<script lang="ts">
  import { GamesProvider } from 'svelte-yagames';
</script>

<GamesProvider
  onBeforeLoaded={function (SDK) {
    // SDK Яндекс Игр
    // Здесь можно установить язык игре, обратившись к `SDK.environment.i18n.lang`, и т.д.
  }}

  onGamesObject={function (games) {
    // games — объект, который возвращает функция `useGames()`, обратиться к SDK Яндекс Игр можно по ключу `sdk`,
    // также в объекте есть `player` — результат функции `SDK.getPlayer`, и `authorized` — авторизован ли игрок,
    // помимо этого имеется `data` и `stats` — обёртки над `player.setData()`, `player.getData()`, и `player.setStats()`, `player.getStats()` соответственно,
    // но с запасным вариантом сохранения в `localStorage`.

    // Здесь можно настроить что-то, что зависит от объекта games, при этом игра ещё не будет показана
  }}
>
  <svelte:fragment slot="loading">
    Показывается, пока не произошла полная загрузка
  </svelte:fragment>

  <svelte:fragment slot="error" let:error>
    Если произошла ошибка при загрузке, показывается этот экран. Ошибка: {error}
  </svelte:fragment>

  Здесь отображается основная игра
</GamesProvider>
```

## createReactive

createReactive — функция для удобной работы с данными игрока. Вместо ручного вызова `games.data.set({ данные })` изменение стора приводит к их сохранению. По-умолчанию данные сохраняются раз в 750 миллисекунд при их изменении.

```svelte
<script lang="ts" context="module">
  import { GamesProvider, createReactive } from 'svelte-yagames';

  /**
   * Если произойдёт ошибка при загрузке данных или если данных на сервере нет, то будут использоваться переданные параметры
   */
  const { init, data, stats } = createReactive({
    data: {
      /**
       * Предметы игрока. Меняется не так часто, и представляет из себя массив, поэтому используется `data`
       */
      items: []
    },
    stats: {
      /**
       * Счёт игрока. Меняется часто, поэтому рекомендуется использовать `stats`
       */
      score: 0
    }
  });

  /**
   * Экспортируем для использования в других компонентах
   */
  export { data, stats };
</script>

<script lang="ts">
</script>

<GamesProvider
  onGamesObject={async function (games) {
    /**
     * Инициализируем. Важно не пропустить `await`, т.к. без него загрузка данных произойдёт позже загрузки, которую предоставляет GamesProvider
     */
    await init(games);
  }}
>
  <button
    type="button"
    on:click={function() {
      $stats.score++;
    }}
  >
    Счёт: {$stats.score}
  </button>

  <button
    type="button"
    on:click={function () {
      /**
       * Если предмета нет, и счёт больше цены
       */
      if (!$data.items.includes('Плащ') && $stats.score >= 5) {
        /**
         * Просто изменяем стор, сохранение произойдёт автоматически
         */
        $data.items = [...$data.items, 'Плащ'];
        $stats.score -= 5;
      }
    }}
  >
    Купить Плащ
  </button>
</GamesProvider>
```

## Actions

Экспортируются некоторые полезные экшены, которые могут быть полезны при разработке игры.

- `clickOutside` — нажатие вне элемента.
- `enterClickOne` — запрет вызова `on:click` больше, чем один раз, при зажатой клавише `Enter`. Позволяет предотвратить, например, накрутку показателей в кликерах.
- `events` — экшн от AlexxNB. Экшн позволяет передавать в компонент все слушатели событий.
- `image` — экшн запрещает перетаскивать картинку, и открывать контекстное меню на ней (длинное удержание на экране).

## Utilities

Используемые в проекте утилиты экспортируются

- `isEmpty` — проверяет, пустой ли объект. `isEmpty({ a: 1 }) // false`, а `isEmpty({}) // true`.
- `throttle` — функция throttle. Используется версия с сайта [learn.javascript.ru](https://learn.javascript.ru/task/throttle).