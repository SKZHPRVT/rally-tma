export class EngineSound {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;
  private started: boolean = false;
  
  // Пульсация
  private pulseTime: number = 0;
  private pulseRate: number = 0;

  constructor() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = 60;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 800;

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

    // Обороты: 60 Гц холостые, до 350 Гц на максималке
    const baseFreq = 60 + speedRatio * 290; // 60-350
    this.osc.frequency.linearRampToValueAtTime(baseFreq, now + 0.05);

    // Фильтр: чем быстрее — тем ярче
    const targetFilter = 800 + speedRatio * 1600; // 800-2400
    this.filter.frequency.linearRampToValueAtTime(targetFilter, now + 0.05);

    // === ГРОМКОСТЬ + ПУЛЬСАЦИЯ ===
    // Если на максимальной скорости (speedRatio > 0.9) — пульсируем как при частом нажатии газа
    let targetGain;
    
    if (speedRatio > 0.9 && (gas || speed > 30)) {
      // Пульсация: 8 раз в секунду
      this.pulseTime += dt;
      const pulseFreq = 8; // Гц
      const phase = (this.pulseTime * pulseFreq) % 1;
      
      // Резкий импульс: 0→1 за 0.1, 1→0 за 0.9
      let pulse;
      if (phase < 0.15) {
        pulse = phase / 0.15; // 0→1
      } else {
        pulse = 1 - (phase - 0.15) / 0.85; // 1→0
      }
      
      // Базовый уровень 0.10 + пульсация до 0.20
      targetGain = 0.10 + pulse * 0.10;
    } else {
      // Обычный звук
      if (gas) {
        targetGain = 0.15;
      } else if (speed > 0.5) {
        targetGain = 0.08;
      } else {
        targetGain = 0.04;
      }
      this.pulseTime = 0;
    }
    
    // Быстрый отклик для пульсации (без linearRamp — мгновенно)
    this.gain.gain.setValueAtTime(targetGain, now);
  }
}
