import type { SDK } from './sdk';

import copy from 'copy-text-to-clipboard';

const createStorage = (key: string) => {
  const createMarked = (mark: string) => ({
    async get() {
      try {
        const value = localStorage.getItem(`${key}-${mark}`)
        const parsed = value ? JSON.parse(value) : null

        return parsed || {};
      } catch {
        return {};
      }
    },
    async set(data: unknown) {
      try {
        return localStorage.setItem(`${key}-${mark}`, JSON.stringify(data))
      } finally { }
    },
  });

  const DataStorage = createMarked('data');
  const StatsStorage = createMarked('stats');

  return { DataStorage, StatsStorage }
}

const { DataStorage, StatsStorage } = createStorage('game');

const noop = () => {};
const async_noop = async () => {};
const stub_false = () => false;
const async_stub_false = async () => false;

const REWARD = true;

const ExternalSDK: SDK = {
  features: {
    LoadingAPI: {
      ready: noop
    }
  },
  auth: {
    openAuthDialog: async_noop,
  },
  adv: {
    async getBannerAdvStatus() {
      return {
        stickyAdvIsShowing: false,
        reason: 'UNKNOWN'
      }
    },
    async showBannerAdv() {
      return {
        stickyAdvIsShowing: false,
        reason: 'UNKNOWN'
      }
    },
    async hideBannerAdv() {
      return {
        stickyAdvIsShowing: false
      }
    },
    async showFullscreenAdv({ callbacks: { onOpen, onClose, onOffline } }) {
      onOpen?.();

      if (!navigator.onLine) onOffline?.();

      onClose?.(REWARD);
    },
    async showRewardedVideo({ callbacks: { onOpen, onClose, onRewarded } }) {
      onOpen?.();

      if (REWARD) onRewarded?.();

      onClose?.()
    }
  },
  environment: {
    app: {
      id: 'unknown'
    },
    browser: {
      get lang() {
        return navigator.language.slice(0, 2);
      }
    },
    i18n: {
      get lang() {
        return ExternalSDK.environment.browser.lang;
      },
      get tld() {
        const parts = location.host.split('.');
        const last = parts.length - 1;
        const tld = parts[last];

        return tld;
      }
    },
    get payload() {
      const sp = new URLSearchParams(location.search);

      return sp.get('payload') || '';
    }
  },
  clipboard: {
    writeText(text) {
      copy(text);
    }
  },
  feedback: {
    async canReview() {
      return {
        value: false,
        reason: 'UNKNOWN'
      }
    },
    async requestReview() {
      return {
        feedbackSent: false
      }
    }
  },
  getStorage: async function () {
    /**
     * Игра скорее всего запускается вне <iframe />, поэтому на Safari не должно быть проблем с `localStorage`
     */
    return localStorage;
  },
  shortcut: {
    async canShowPrompt() {
      return {
        canShow: false,
      }
    },
    async showPrompt() {
      return {
        outcome: ''
      }
    }
  },
  EVENTS: {
    EXIT: 'EXIT',
    HISTORY_BACK: 'HISTORY_BACK'
  },
  isAvailableMethod: async_stub_false,
  async getPlayer() {
    return {
      signature: null,
      getName() {
        return 'unknown'
      },
      getPhoto() {
        return 'data:image;,;'
      },
      getUniqueID() {
        return '0000-0000-0000-0000'
      },
      getMode() {
        return 'lite'
      },
      async getIDsPerGame() {
        return [{ appID: ExternalSDK.environment.app.id, userID: '0000-0000-0000-0000' }]
      },
      async getData(keys) {
        const data = await DataStorage.get();
        const mapped: false | {} = keys && keys.reduce((acc, key) => {
          acc[key] = data[key];
          return acc;
        }, {});

        return mapped || data;
      },
      async setData(data) {
        await DataStorage.set(data);
      },
      async getStats(keys) {
        const data = await StatsStorage.get();
        const mapped: false | {} = keys && keys.reduce((acc, key) => {
          acc[key] = data[key];
          return acc;
        }, {});

        return mapped || data;
      },
      async setStats(stats) {
        await StatsStorage.set(stats);
      },
      async incrementStats(increments) {
        const data = await StatsStorage.get();

        for (const [name, value] of Object.entries(increments)) {
          data[name] = value;
        }

        await StatsStorage.set(data);

        return data
      }
    }
  },
  deviceInfo: {
    isDesktop() {
      return !ExternalSDK.deviceInfo.isMobile() && !ExternalSDK.deviceInfo.isTablet()
    },
    isMobile() {
      return /iPhone|Android/i.test(navigator.userAgent);
    },
    isTablet() {
      return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(navigator.userAgent.toLowerCase())
    },
    isTV: stub_false
  },
  onEvent(name, listener) {
    return () => {}
  },
  async dispatchEvent(name, detail) {

  },
  async getLeaderboards() {
    throw new Error('getLeaderboards() Fallback is not implemented');
  }
}

export { ExternalSDK, DataStorage, StatsStorage }