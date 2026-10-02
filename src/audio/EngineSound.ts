export class EngineSound {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;

  constructor() {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctx();

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

    this.osc.start();
  }

  private tryResume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  update(velocity: number, gas: boolean) {
    this.tryResume();

    const speed = Math.abs(velocity);
    const now = this.ctx.currentTime;

    const targetFreq = 60 + speed * 8;
    this.osc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);

    const targetFilter = 800 + speed * 40;
    this.filter.frequency.linearRampToValueAtTime(targetFilter, now + 0.1);

    const targetGain = gas ? 0.15 : (speed > 0.5 ? 0.08 : 0.04);
    this.gain.gain.linearRampToValueAtTime(targetGain, now + 0.1);
  }
}
