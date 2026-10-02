import { Car } from '../entities/Car';
import { Track } from '../entities/Track';

type Mode = 'idle' | 'race' | 'free' | 'countdown';

export class HUD {
  timerEl: HTMLElement;
  speedEl: HTMLElement;
  menuBtn: HTMLElement;
  
  startModal: HTMLElement;
  archModal: HTMLElement;
  finishModal: HTMLElement;
  finishTimeEl: HTMLElement;
  countdownEl: HTMLElement;
  countdownNumberEl: HTMLElement;
  
  mode: Mode = 'idle';
  elapsed: number = 0;
  
  countdownValue: number = 3;
  countdownTimer: number = 0;
  
  // Антидубль для арки
  private archTriggered: boolean = false;
  
  onNewWorld: (() => void) | null = null;

  constructor() {
    this.timerEl = document.getElementById('timer')!;
    this.speedEl = document.getElementById('speed')!;
    this.menuBtn = document.getElementById('btn-menu')!;
    
    this.startModal = document.getElementById('start-modal')!;
    this.archModal = document.getElementById('arch-modal')!;
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
    
    // Меню арки
    document.getElementById('btn-arch-race')!.addEventListener('click', () => {
      this.archModal.classList.remove('show');
      this.startCountdown();
    });
    document.getElementById('btn-arch-newtrack')!.addEventListener('click', () => {
      this.archModal.classList.remove('show');
      if (this.onNewWorld) this.onNewWorld();
    });
    document.getElementById('btn-arch-close')!.addEventListener('click', () => {
      this.archModal.classList.remove('show');
      // Продолжаем свободную езду
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
    
    // Кнопка меню (сверху справа)
    this.menuBtn.addEventListener('click', () => {
      this.showStartMenu();
    });
  }

  // === РЕЖИМЫ ===
  startRace() {
    this.mode = 'race';
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
    this.menuBtn.classList.remove('show');
    this.archTriggered = false;
    console.log('[hud] RACE mode');
  }

  startFreeRide() {
    this.mode = 'free';
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
    this.startModal.classList.remove('show');
    this.menuBtn.classList.add('show');
    this.archTriggered = false;
    console.log('[hud] FREE mode');
  }

  startCountdown() {
    this.startModal.classList.remove('show');
    this.finishModal.classList.remove('show');
    this.archModal.classList.remove('show');
    this.mode = 'countdown';
    this.countdownValue = 3;
    this.countdownTimer = 1.0;
    this.countdownNumberEl.textContent = '3';
    this.countdownNumberEl.classList.remove('go');
    this.countdownEl.classList.add('show');
    this.menuBtn.classList.remove('show');
    console.log('[hud] COUNTDOWN start');
  }

  showStartMenu() {
    this.mode = 'idle';
    this.startModal.classList.add('show');
    this.archModal.classList.remove('show');
    this.finishModal.classList.remove('show');
    this.countdownEl.classList.remove('show');
    this.menuBtn.classList.remove('show');
    this.elapsed = 0;
    this.timerEl.textContent = '00:00.00';
  }

  showFinish() {
    this.finishTimeEl.textContent = this.formatTime(this.elapsed);
    this.finishModal.classList.add('show');
    this.menuBtn.classList.remove('show');
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
          this.countdownEl.classList.remove('show');
          this.startRace();
        }
      }
    }
    
    // === ТАЙМЕР (в гонке) ===
    if (this.mode === 'race') {
      this.elapsed += dt;
      
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
    
    // === АРКА-ТРИГГЕР (в свободной езде) ===
    if (this.mode === 'free' && track && !this.archTriggered) {
      const startPoint = track.startPoint;
      const dx = car.position.x - startPoint.x;
      const dz = car.position.z - startPoint.z;
      const distToStart = Math.sqrt(dx * dx + dz * dz);
      
      // Если заехал в арку — показать меню
      if (distToStart < 10) {
        this.archTriggered = true;
        this.archModal.classList.add('show');
        console.log('[hud] ARCH triggered — showing menu');
      }
    }
    
    // Сбрасываем триггер когда отъехал
    if (this.mode === 'free' && track && this.archTriggered) {
      const startPoint = track.startPoint;
      const dx = car.position.x - startPoint.x;
      const dz = car.position.z - startPoint.z;
      const distToStart = Math.sqrt(dx * dx + dz * dz);
      
      if (distToStart > 30) {
        this.archTriggered = false;
      }
    }
    
    this.timerEl.textContent = this.formatTime(this.elapsed);
    
    const kmh = Math.abs(car.velocity * 3.6);
    this.speedEl.innerHTML = `${Math.round(kmh)} <span>km/h</span>`;
  }

  canControl(): boolean {
    // Блок управления когда открыта любая модалка
    if (this.startModal.classList.contains('show')) return false;
    if (this.archModal.classList.contains('show')) return false;
    if (this.finishModal.classList.contains('show')) return false;
    if (this.mode === 'countdown') return false;
    return this.mode === 'race' || this.mode === 'free';
  }
}
