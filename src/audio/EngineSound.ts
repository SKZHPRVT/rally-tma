export class EngineSound {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;
  private started: boolean = false;

  constructor() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = 60;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 700;

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

    // 60 → 175 Гц (было 200)
    let targetFreq;
    if (speedRatio > 0.95) {
      targetFreq = 175;
    } else {
      targetFreq = 60 + speedRatio * 115; // 60-175
    }
    this.osc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);

    const targetFilter = 700 + speedRatio * 500;
    this.filter.frequency.linearRampToValueAtTime(targetFilter, now + 0.1);

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
