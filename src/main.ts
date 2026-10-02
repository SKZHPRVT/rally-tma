import { Game } from './game/Game';

let game: Game | null = null;

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

  // Тёмные цвета под UI
  if (tg.setHeaderColor) tg.setHeaderColor('#000000');
  if (tg.setBackgroundColor) tg.setBackgroundColor('#000000');
  if (tg.BackButton) tg.BackButton.hide();

  console.log('[tg] version:', tg.version, 'platform:', tg.platform);
}

function forceResize() {
  if (!game) return;
  
  // Ждём пока WebView пересчитает размеры
  setTimeout(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log('[resize]', w, h);
    
    // Обновляем canvas через Game
    const renderer = (game as any).renderer;
    const camera = (game as any).camera;
    if (renderer && camera) {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }, 100);
}

window.addEventListener('load', () => {
  initTelegram();
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  game = new Game(canvas);
  game.start();
  console.log('[main] Game started');
});

// Пересчёт при повороте экрана
window.addEventListener('orientationchange', () => {
  console.log('[main] orientation changed');
  forceResize();
});

// На случай если Telegram делает resize
window.addEventListener('resize', () => {
  forceResize();
});

// И на изменение viewport (Telegram бывает капризный)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    forceResize();
  });
}
