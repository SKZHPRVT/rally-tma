import { Game } from './game/Game';

function initTelegram() {
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    console.log('[tg] Telegram OK');
  }
}

window.addEventListener('load', () => {
  initTelegram();
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const game = new Game(canvas);
  game.start();
  console.log('[main] Game started');
});
