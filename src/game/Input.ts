export class Input {
  gas: boolean = false;
  brake: boolean = false;
  left: boolean = false;
  right: boolean = false;

  constructor() {
    // Разблокировка AudioContext при первом тапе
    const unlockAudio = () => {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
      }
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('mousedown', unlockAudio);
    };
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('mousedown', unlockAudio, { once: true });

    document.addEventListener('keydown', (e) => this.onKey(e, true));
    document.addEventListener('keyup', (e) => this.onKey(e, false));

    this.bindButton('btn-gas', 'gas');
    this.bindButton('btn-brake', 'brake');
    this.bindButton('btn-left', 'left');
    this.bindButton('btn-right', 'right');
  }

  onKey(e: KeyboardEvent, down: boolean) {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': this.gas = down; break;
      case 'ArrowDown': case 's': case 'S': this.brake = down; break;
      case 'ArrowLeft': case 'a': case 'A': this.left = down; break;
      case 'ArrowRight': case 'd': case 'D': this.right = down; break;
    }
  }

  bindButton(id: string, prop: keyof Input) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const set = (val: boolean) => { (this as any)[prop] = val; };
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); set(true); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); set(false); });
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); set(false); });
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); set(true); });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); set(false); });
    btn.addEventListener('mouseleave', () => set(false));
  }
}
