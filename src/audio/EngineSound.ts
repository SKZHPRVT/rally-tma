export class EngineSound {
  private ctx: AudioContext;
  private osc1: OscillatorNode;
  private osc2: OscillatorNode;
  private noise: AudioBufferSourceNode;
  private noiseGain: GainNode;
  private filter: BiquadFilterNode;
  private gain: GainNode;
  private started: boolean = false;

  // Brake squeal
  private brakeOsc: OscillatorNode;
  private brakeGain: GainNode;
  private brakeFilter: BiquadFilterNode;

  constructor() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    // === Двигатель: OSC 1 ===
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.value = 40;

    // === Двигатель: OSC 2 (суб-октава) ===
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'square';
    this.osc2.frequency.value = 20;

    // === Шум (рычание) ===
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    this.noise = this.ctx.createBufferSource();
    this.noise.buffer = noiseBuffer;
    this.noise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 120;
    noiseFilter.Q.value = 2;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0;

    // === Общий фильтр ===
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 400;
    this.filter.Q.value = 1;

    // === Общая громкость ===
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;

    // Соединяем мотор
    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    this.noise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.ctx.destination);

    // === BRAKE SQUEAL (визг тормозов) ===
    this.brakeOsc = this.ctx.createOscillator();
    this.brakeOsc.type = 'sawtooth';
    this.brakeOsc.frequency.value = 2000; // высокий визг

    this.brakeFilter = this.ctx.createBiquadFilter();
    this.brakeFilter.type = 'highpass';
    this.brakeFilter.frequency.value = 1800;

    this.brakeGain = this.ctx.createGain();
    this.brakeGain.gain.value = 0;

    this.brakeOsc.connect(this.brakeFilter);
    this.brakeFilter.connect(this.brakeGain);
    this.brakeGain.connect(this.ctx.destination);
  }

  start() {
    if (this.started) return;
    try {
      this.osc1.start();
      this.osc2.start();
      this.noise.start();
      this.brakeOsc.start();
      this.started = true;
      console.log('[engine] started');
    } catch (e) {
      console.log('[engine] start failed:', e);
    }
  }

  // velocity (м/с), gas, brake
  update(velocity: number, gas: boolean, brake: boolean) {
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

    // === ОБОРОТЫ ===
    // Потолок 160 Гц (было 180) — чтобы на максималке не пищал
    const rpmCurve = Math.pow(speedRatio, 0.7);
    const baseFreq = 40 + rpmCurve * 120; // 40-160 Гц
    
    // Когда достигаем максимума — фиксируем частоту и НЕ растёт
    const finalFreq = speedRatio > 0.95 ? 160 : baseFreq;
    
    this.osc1.frequency.setTargetAtTime(finalFreq, now, 0.1);
    this.osc2.frequency.setTargetAtTime(finalFreq / 2, now, 0.1);

    // === ФИЛЬТР ===
    const filterFreq = 300 + rpmCurve * 700; // 300-1000 Гц
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.15);

    // === ШУМ (рычание) ===
    // На максимуме — чуть больше шума
    const noiseLevel = speedRatio * 0.18;
    this.noiseGain.gain.setTargetAtTime(noiseLevel, now, 0.15);

    // === ГРОМКОСТЬ МОТОРА ===
    let targetGain;
    if (gas) {
      targetGain = 0.12 + speedRatio * 0.05; // 0.12-0.17
    } else if (speed > 0.5) {
      targetGain = 0.06 + speedRatio * 0.03; // 0.06-0.09
    } else {
      targetGain = 0.03;
    }
    this.gain.gain.setTargetAtTime(targetGain, now, 0.1);

    // === BRAKE SQUEAL ===
    // Визг тормозов только когда brake=true и скорость > 5 м/с
    let brakeVol = 0;
    if (brake && speed > 5) {
      brakeVol = Math.min((speed - 5) / 20, 1) * 0.04; // максимум 0.04
    }
    this.brakeGain.gain.setTargetAtTime(brakeVol, now, 0.05);
  }
}
