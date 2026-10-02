import { Car } from '../entities/Car';
import { Track } from '../entities/Track';

type Mode = 'idle' | 'race' | 'free' | 'countdown';

export class HUD {
  timerEl: HTMLElement;
  speedEl: HTMLElement;
  
  startModal: HTMLElement;
  finishModal: HTMLElement;
  finishTimeEl: HTMLElement;
  countdownEl: HTMLElement;
  countdownNumberEl: HTMLElement;
  
  mode: Mode = 'idle';
  elapsed: number = 0;
  
  // Отсчёт
  countdownValue: number = 3;
  countdownTimer: number = 0;
  
  // Callback для смены мира
  onNewWorld: (() => void) | null = null;

  constructor() {
    this.timerEl = document.getElementById('timer')!;
    this.speedEl = document.getElementById('speed')!;
    
    this.startModal = document.getElementById('start-modal')!;
    this.finishModal = document.getElementById('finish-modal')!;
    this.finishTimeEl = document.getElementById('finish-time')!;
    this.countdownEl = document.getElementById('countdown')!;
    this.countdownNumberEl = document.getElementById('countdown-number')!;
    
    // Стартовое меню
    document.getElementById('btn-start-race')!.addEventListener('click', () => {
      this.startCountdown();
    });
    
    document.getElementById('btn-start-free')!.addEventListener('click', () => {
      this.startFreeRide();
    });
    
    // Финиш
    document.getElementById('btn-retry')!.addEventListener('click', () => {
      this.finishModal.classList.remove('show');
      this.startCountdown();
    });
    
    document.getElementById('btn-new-world')!.addEventListener('click', () => {
      this.finishModal.classList.remove('show');
      if (this.onNewWorld) this.onNewWorld();
    });
  }

  // === РЕЖИМЫ ===
  startRace() {
    this.mode = 'race';
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
    console.log('[hud] RACE mode');
  }

  startFreeRide() {
    this.mode = 'free';
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
    this.startModal.classList.remove('show');
    console.log('[hud] FREE mode');
  }

  startCountdown() {
    this.startModal.classList.remove('show');
    this.finishModal.classList.remove('show');
    this.mode = 'countdown';
    this.countdownValue = 3;
    this.countdownTimer = 1.0;
    this.countdownNumberEl.textContent = '3';
    this.countdownNumberEl.classList.remove('go');
    this.countdownEl.classList.add('show');
    console.log('[hud] COUNTDOWN start');
  }

  // Возврат в стартовое меню (после генерации новой карты)
  showStartMenu() {
    this.mode = 'idle';
    this.startModal.classList.add('show');
    this.finishModal.classList.remove('show');
    this.countdownEl.classList.remove('show');
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
  }

  showFinish() {
    this.finishTimeEl.textContent = this.formatTime(this.elapsed);
    this.finishModal.classList.add('show');
    this.mode = 'idle';
  }

  formatTime(t: number): string {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return (
      `${min.toString().padStart(2, '0')}:` +
      `${sec.toString().padStart(2, '0')}.` +
      `${ms.toString().padStart(2, '0')}`
    );
  }

  update(dt: number, car: Car, track?: Track) {
    // === ОТСЧЁТ ===
    if (this.mode === 'countdown') {
      this.countdownTimer -= dt;
      
      if (this.countdownTimer <= 0) {
        this.countdownValue--;
        
        if (this.countdownValue > 0) {
          this.countdownNumberEl.textContent = String(this.countdownValue);
          this.countdownTimer = 1.0;
        } else if (this.countdownValue === 0) {
          this.countdownNumberEl.textContent = 'GO!';
          this.countdownNumberEl.classList.add('go');
          this.countdownTimer = 0.7;
        } else {
          // Конец отсчёта — старт гонки
          this.countdownEl.classList.remove('show');
          this.startRace();
        }
      }
    }
    
    // === ТАЙМЕР ===
    if (this.mode === 'race') {
      this.elapsed += dt;
      
      // Финиш — машина проехала круг и вернулась к старту
      if (track && this.elapsed > 5) {
        const startPoint = track.startPoint;
        const dx = car.position.x - startPoint.x;
        const dz = car.position.z - startPoint.z;
        const distToStart = Math.sqrt(dx * dx + dz * dz);
        
        if (distToStart < 12) {
          this.showFinish();
        }
      }
    }
    
    this.timerEl.textContent = this.formatTime(this.elapsed);
    
    // === СКОРОСТЬ ===
    const kmh = Math.abs(car.velocity * 3.6);
    this.speedEl.innerHTML = `${Math.round(kmh)} <span>km/h</span>`;
  }

  // Можно ли управлять машиной
  canControl(): boolean {
    return this.mode === 'race' || this.mode === 'free';
  }
}
