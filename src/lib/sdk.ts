declare global {
  interface Window {
    YaGames?: {
      init(options?: InitOptions): Promise<SDK>;
    };
  }
}

interface InitOptions {
  screen?: InitScreenOptions
}

interface InitScreenOptions {
  /**
   * Признак перехода в полноэкранный режим при открытии игры или при первом действии пользователя.
   * @default true
   */
  fullscreen?: boolean;
  /**
   * Настройки экрана во время игры.
   */
  orientation?: InitScreenOptionsOrientation;
}

interface InitScreenOptionsOrientation {
  /**
   * Ориентация экрана.
   */
  value?: "portrait" | "landscape"
  /**
   * Признак блокировки поворота экрана.
   * 
   * Учитывается, если задан параметр `value`.
   * 
   * @default false
   */
  lock?: boolean;
}

interface GetPlayerOptions {
  scopes?: boolean;
  signed?: boolean;
}

type PlayerMode = ("lite" & Record<never, never>) | string;

interface Player {
  signature: unknown;

  getMode(): PlayerMode;

  /**
   * Cохраняет данные пользователя. Максимальный размер данных не должен превышать 200 KБ.
   * @param data Объект, содержащий пары ключ-значение
   * @param flush Определяет очередность отправки данных. При значении «true» данные будут отправлены на сервер немедленно; «false» (значение по умолчанию) — запрос на отправку данных будет поставлен в очередь.
   */
  setData(data: Record<any, any>, flush?: boolean): Promise<unknown>;

  /**
   * Асинхронно возвращает внутриигровые данные пользователя, сохраненные в базе данных Яндекса.
   * @param keys Список ключей, которые необходимо вернуть. Если параметр keys отсутствует, то метод возвращает все внутриигровые данные пользователя.
   */
  getData(keys?: string[]): Promise<any>;

  /**
   * Cохраняет численные данные пользователя. Максимальный размер данных не должен превышать 10 КБ.
   * @param stats Объект, содержащий пары ключ-значение, где каждое значение должно быть числом.
   */
  setStats(stats: Record<string, number>): Promise<unknown>;

  /**
   * Изменяет внутриигровые данные пользователя. Максимальный размер данных не должен превышать 10 КБ.
   * @param increments Объект, который содержит пары ключ-значение, где каждое значение должно быть числом.
   * @returns Объект, который содержит измененные и добавленные пары ключ-значение.
   */
  incrementStats(increments: Record<string, number>): Promise<Record<string, number>>;

  /**
   * Асинхронно возвращает численные данные пользователя.
   * @param keys Список ключей, которые необходимо вернуть. Если параметр `keys` отсутствует, то метод возвращает все внутриигровые данные пользователя.
   */
  getStats(keys?: string[]): Promise<Record<string, number>>;

  /**
   * Возвращает постоянный уникальный идентификатор пользователя
   */
  getUniqueID(): string;
  getIDsPerGame(): Promise<{ appID: string; userID: string; }[]>

  /**
   * Возвращает имя пользователя
   */
  getName(): string;

  /**
   * Возвращает URL аватара пользователя
   * @param size Требуемый размер
   */
  getPhoto(size: "small" | "medium" | "large"): string;
}

interface Auth {
  openAuthDialog(): Promise<unknown>;
}

interface Feedback {
  canReview(): Promise<
    {
      value: true
    }
      |
    {
      value: false,
      reason: "NO_AUTH" | "GAME_RATED" | "REVIEW_ALREADY_REQUESTED" | "REVIEW_WAS_REQUESTED" | "UNKNOWN"
    }
  >;

  requestReview(): Promise<{
    feedbackSent: boolean;
  }>
}

interface Environment {
  /**
   * Данные игры.
   */
  app: {
    /**
     * Идентификатор игры.
     */
    id: string;
  }
  /**
   * Данные браузера.
   */
  browser: {
    /**
     * Приоритетный язык браузера в формате ISO 639-1.
     */
    lang: string;
  },
  /**
   * Интернационализация на сервисе.
   */
  i18n: {
    /**
     * Язык интерфейса Яндекс Игр в формате ISO 639-1.
     * 
     * Рекомендуем использовать этот параметр для определения языка пользователя в игре.
     */
    lang: string;
    /**
     * Домен верхнего уровня.
     */
    tld: string;
  },
  /**
   * Значение параметра `payload` из адреса игры.
   */
  payload?: string;
}

interface Adv {
  /**
   * Блоки с рекламой, которые полностью закрывают фон приложения и показываются между запросом какой-то информации пользователем (например, при переходе на следующий уровень игры) и ее получением.
   */
  showFullscreenAdv(
    params: {
      callbacks: {
        /**
         * Вызывается при закрытии рекламы, после ошибки, а также, если реклама не открылась по причине слишком частого вызова
         */
        onClose?(wasShown: boolean): void;
        /**
         * Вызывается при успешном открытии рекламы.
         */
        onOpen?(): void;
        /**
         * Вызывается при возникновении ошибки.
         * 
         * @param error Ошибка
         */
        onError?(error: unknown): void;
        /**
         * Вызывается при потере сетевого соединения (переходе в офлайн-режим).
         */   
        onOffline?(): void;
      }
    }
  ): Promise<void>
  showRewardedVideo(
    params: {
      callbacks: {
        /**
         * Вызывается при закрытии видеорекламы.
         */
        onClose?(): void;
        /**
         * Вызывается при отображении видеорекламы на экране.
         */
        onOpen?(): void;
        /**
         * Вызывается при возникновении ошибки.
         * 
         * @param error Ошибка
         */
        onError?(error: unknown): void;
        /**
         * Вызывается, когда засчитывается просмотр видеорекламы. Укажите в данной функции, какую награду пользователь получит после просмотра.
         */
        onRewarded?(): void;
      }
    }
  ): Promise<void>;

  /**
   * Показывает статус баннера
   */
  getBannerAdvStatus(): Promise<
    {
      stickyAdvIsShowing: true;
    }
      |
    {
      stickyAdvIsShowing: false;
      reason?: "ADV_IS_NOT_CONNECTED" | "UNKNOWN"
    }
  >;

  /**
   * Вызывает баннер;
   */
  showBannerAdv(): Promise<
    {
      stickyAdvIsShowing: true;
    }
      |
    {
      stickyAdvIsShowing: false;
      reason?: "ADV_IS_NOT_CONNECTED" | "UNKNOWN"
    }
  >;

  /**
   * Убирает баннер
   */
  hideBannerAdv(): Promise<{
    stickyAdvIsShowing: boolean;
  }>
}

interface ESdkEventName {
  EXIT: "EXIT";
  HISTORY_BACK: "HISTORY_BACK";
}

interface Shortcut {
  canShowPrompt(): Promise<{
    canShow: boolean;
  }>;

  showPrompt(): Promise<{
    outcome: ("accepted" & Record<never, never>) | string;
  }>
}

type GetLeaderboardEntriesParameters = {
  /**
   * Определяет, включать ли авторизованного пользователя в ответ
   */
  includeUser: boolean,
  /**
   * Количество записей ниже и выше пользователя по лидерборду, которое нужно вернуть. Минимальное значение — 1, максимальное — 10. По умолчанию возвращается 5.
   */
  quantityAround: number,
  /**
   * Количество записей из топа лидерборда. Минимальное значение — 1, максимальное — 20. По умолчанию возвращается 5.
   */
  quantityTop: number
}

interface Leaderboards {
  /**
   * @param leaderboardName Имя лидерборда.
   */
  getLeaderboardDescription(leaderboardName: string): Promise<{
    /**
     * Идентификатор приложения.
     */
    appID: string;
    /**
     * Если true, то лидерборд является основным.
     */
    dеfault: boolean;
    description: {
      /**
       * Направление сортировки
       * 
       * `false` — места отсортированы по убыванию;
       * `true` — места отсортированы по возрастанию.
       */
      invert_sort_order: boolean;
      score_format: {
        options: {
          /**
           * Размер десятичной части счета.
           * Например, при `decimal_offset: 2` число `1234` будет отображаться как `12.34`.
           */
          decimal_offset: number;
        }
      };
      /**
       * Тип результата лидерборда.
       */
      type: "numeric" | "time";
    }
    /**
     * Имя лидерборда.
     */
    name: string;
    /**
     * Локализованные названия.
     */
    title: Partial<Record<"ru" | "en" | "be" | "uk" | "kk" | "uz" | "tr", string>> & Record<(string & {}), string>
  }>;
  /**
   * @param leaderboardName Имя лидерборда.
   * @param score Значение результата. Принимается только тип `number`. Не может быть отрицательным. Если тип лидерборда — `time`, то значения необходимо передавать в миллисекундах.
   * @param extraData Описание пользователя. Необязательный параметр.
   */
  setLeaderboardScore(leaderboardName: string, score: number, extraData?: string): Promise<void>;
  /**
   * @param leaderboardName Имя лидерборда.
   */
  getLeaderboardPlayerEntry(leaderboardName: string): Promise<{
    /**
     * Значение результата.
     */
    score: number;
    /**
     * Описание пользователя.
     */
    extraData: string;
    rank: number;
    player: {
      /**
       * Возвращает URL портрета пользователя. 
       * @param size Размер портрета пользователя
       */
      getAvatarSrc: (size: "small" | "medium" | "large") => string;
      /**
       * Возвращает srcset портрета пользователя, который подходит для дисплеев Retina.
       * @param size Размер портрета пользователя
       */
      getAvatarSrcSet: (size: "small" | "medium" | "large") => string;
      lang: string;
      publicName: string;
      scopePermissions: {
        avatar: string;
        public_name: string;
      };
      uniqueID: string;
    };
    formattedScore: string;
  }>;
  /**
   * @param leaderboardName Имя лидерборда.
   * @param parameters 
   */
  getLeaderboardEntries(leaderboardName: string, parameters: GetLeaderboardEntriesParameters): Promise<{
    leaderboard: unknown;
    /**
     * Интервалы мест в ответе.
     */
    ranges: {
      /**
       * Место в рейтинге. Счет ведется с нуля, поэтому 1-е место считается нулевым элементом.
       */
      start: number;
      /**
       * Количество запрошенных записей. Если данных не хватает, то может не соответствовать ответу.
       */
      size: number;
    }[];
    /**
     * Место пользователя в рейтинге. Если отсутствует, либо запрос на топ без включения пользователя, то равен 0.
     */
    userRank: number;
    /**
     * Результаты по запросу.
     */
    entries: {
      /**
       * Значение результата.
       */
      score: number;
      /**
       * Описание пользователя
       */
      extraData: string;
      rank: number;
      player: {
        /**
         * Возвращает URL портрета пользователя. 
         * @param size Размер портрета пользователя
         */
        getAvatarSrc: (size: "small" | "medium" | "large") => string;
        /**
         * Возвращает srcset портрета пользователя, который подходит для дисплеев Retina.
         * @param size Размер портрета пользователя
         */
        getAvatarSrcSet: (size: "small" | "medium" | "large") => string;
        lang: string,
        publicName: string,
        scopePermissions: {
          avatar: string,
          public_name: string
        },
        uniqueID: string,
      },
      formattedScore: string
    }[]
  }>
}

interface SDK {
  auth: Auth;

  getPlayer(options?: GetPlayerOptions): Promise<Player>;

  isAvailableMethod(method: 'leaderboards.setLeaderboardScore' | (string & {})): Promise<boolean>;

  getStorage(): Promise<Storage>

  feedback: Feedback;
  environment: Environment;
  adv: Adv;

  EVENTS: ESdkEventName;

  dispatchEvent(eventName: ESdkEventName, detail?: Record<any, any>): Promise<unknown>;
  onEvent(eventName: ESdkEventName, listener: () => void): () => void;

  getLeaderboards(): Promise<Leaderboards>;

  /**
   * Это не будет описан мной, поскольку не использую платежи
   */
  getPayments(): Promise<unknown>;

  shortcut: Shortcut;

  clipboard: {
    writeText(text: string): unknown;
  };

  deviceInfo: {
    isMobile(): boolean;
    isDesktop(): boolean;
    isTablet(): boolean;
    isTV(): boolean;
  }

  features: {
    LoadingAPI?: {
      ready?(): void;
    }
  }
}

export type { SDK, Player, InitOptions, GetPlayerOptions }