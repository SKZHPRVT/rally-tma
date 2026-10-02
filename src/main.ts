import { Game } from './game/Game';

function initTelegram() {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) {
    console.log('[tg] not in Telegram');
    return;
  }

  tg.ready();
  tg.expand();

  if (typeof tg.requestFullscreen === 'function') {
    try {
      tg.requestFullscreen();
      console.log('[tg] fullscreen requested');
    } catch (e) {
      console.log('[tg] fullscreen failed:', e);
    }
  }

  if (tg.setHeaderColor) tg.setHeaderColor('#87ceeb');
  if (tg.setBackgroundColor) tg.setBackgroundColor('#87ceeb');
  if (tg.BackButton) tg.BackButton.hide();

  console.log('[tg] version:', tg.version, 'platform:', tg.platform);
}

window.addEventListener('load', () => {
  initTelegram();
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const game = new Game(canvas);
  game.start();
  console.log('[main] Game started');
});
