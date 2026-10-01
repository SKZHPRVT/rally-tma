declare global {
  interface Window {
    Telegram?: { WebApp?: any };
  }
}

export const tg = {
  get app() { return window.Telegram?.WebApp; },
  get isTMA() { return !!window.Telegram?.WebApp?.initData; },
  init() {
    const a = this.app;
    if (!a) return;
    a.ready();
    a.expand();
  },
  haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    this.app?.HapticFeedback?.impactOccurred(style);
  },
  get userId(): number | null {
    const id = this.app?.initDataUnsafe?.user?.id;
    return typeof id === 'number' ? id : null;
  },
};
