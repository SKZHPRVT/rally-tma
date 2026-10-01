// Ловим ошибки и пишем в HTML, чтобы не открывать Console
window.addEventListener('error', (e) => {
  document.body.innerHTML = `<pre style="color:red;background:#111;padding:20px;font-size:16px;white-space:pre-wrap">
ERROR: ${e.message}
FILE: ${e.filename}
LINE: ${e.lineno}:${e.colno}
STACK: ${e.error?.stack || ''}
  </pre>`;
});

// Пишем статус прямо в HTML
document.body.innerHTML = `<pre style="color:#0f0;background:#111;padding:20px;font-size:16px">
[main] loading...
Phaser typeof: ${typeof (window as any).Phaser}
</pre>`;

setTimeout(() => {
  try {
    const P = (window as any).Phaser;
    if (!P) {
      document.body.innerHTML = `<pre style="color:red;background:#111;padding:20px">Phaser НЕ загружен! Проверь /phaser.min.js</pre>`;
      return;
    }
    document.body.innerHTML = `<pre style="color:#0f0;background:#111;padding:20px">Phaser OK, version: ${P.VERSION}</pre>`;

    new P.Game({
      type: P.CANVAS,
      parent: 'game',
      width: 800,
      height: 600,
      backgroundColor: '#1a1a1a',
      scene: {
        create() {
          this.add.rectangle(400, 300, 400, 200, 0xff4444);
          this.add.text(400, 150, 'RALLY TMA', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
          console.log('[main] scene OK');
        }
      }
    });

    document.getElementById('game')!.style.position = 'absolute';
    document.getElementById('game')!.style.top = '200px';

  } catch (e: any) {
    document.body.innerHTML = `<pre style="color:red;background:#111;padding:20px">CATCH: ${e.message}\n${e.stack}</pre>`;
  }
}, 500);
