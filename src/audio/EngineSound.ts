export class EngineSound {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;
  private started: boolean = false;

  constructor() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    // Осциллятор — пила, звучит как двигатель
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = 60;

    // Фильтр — убирает резкость
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 800;

    // Громкость
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.ctx.destination);
  }

  start() {
    if (this.started) return;
    try {
      this.osc.start();
      this.started = true;
      console.log('[engine] started');
    } catch (e) {
      console.log('[engine] start failed:', e);
    }
  }

  update(velocity: number, gas: boolean, brake: boolean, dt: number = 0.016) {
    if (!this.started) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => this.start());
      } else {
        this.start();
      }
      return;
    }

    const speed = Math.abs(velocity);
    const maxSpeed = 40;
    const speedRatio = Math.min(speed / maxSpeed, 1);
    const now = this.ctx.currentTime;

    // Обороты: 60 → 350 Гц
    // НО на скорости > 95% — фиксируем на 300 Гц, чтобы не пищал
    let targetFreq;
    if (speedRatio > 0.95) {
      targetFreq = 300;
    } else {
      targetFreq = 60 + speedRatio * 240; // 60-300
    }
    this.osc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);

    // Фильтр: чем быстрее — тем ярче
    // НО на макс — фиксируем на 1600, чтобы не пищал
    let targetFilter;
    if (speedRatio > 0.95) {
      targetFilter = 1600;
    } else {
      targetFilter = 800 + speedRatio * 800; // 800-1600
    }
    this.filter.frequency.linearRampToValueAtTime(targetFilter, now + 0.1);

    // Громкость (без пульсации — как было в рабочей версии)
    let targetGain;
    if (gas) {
      targetGain = 0.15;
    } else if (speed > 0.5) {
      targetGain = 0.08;
    } else {
      targetGain = 0.04;
    }
    this.gain.gain.linearRampToValueAtTime(targetGain, now + 0.1);
  }
}
