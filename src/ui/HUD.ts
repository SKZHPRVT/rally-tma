import { Car } from '../entities/Car';
import { Track } from '../entities/Track';

export class HUD {
  timerEl: HTMLElement;
  speedEl: HTMLElement;
  finishModal: HTMLElement;
  finishTimeEl: HTMLElement;
  
  elapsed: number = 0;
  started: boolean = false;      // старт взят?
  finished: boolean = false;     // финиш?
  
  // Для детекции пересечения старта
  lastDistanceToStart: number = 0;

  constructor() {
    this.timerEl = document.getElementById('timer')!;
    this.speedEl = document.getElementById('speed')!;
    this.finishModal = document.getElementById('finish-modal')!;
    this.finishTimeEl = document.getElementById('finish-time')!;
    
    // Кнопки модалки
    document.getElementById('btn-retry')!.addEventListener('click', () => {
      this.hideFinish();
      location.reload();
    });
    
    document.getElementById('btn-new-world')!.addEventListener('click', () => {
      // Пока просто перезагрузка — потом можно добавить генерацию с новым сидом
      this.hideFinish();
      location.reload();
    });
  }

  hideFinish() {
    this.finishModal.classList.remove('show');
  }

  showFinish() {
    this.finishTimeEl.textContent = this.formatTime(this.elapsed);
    this.finishModal.classList.add('show');
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
    // === Детекция старта/финиша ===
    if (track) {
      const startPoint = track.startPoint;
      const dx = car.position.x - startPoint.x;
      const dz = car.position.z - startPoint.z;
      const distToStart = Math.sqrt(dx * dx + dz * dz);
      
      // === Старт ===
      // Машина впервые оказалась близко к старту (< 10 м) — пошёл отсчёт
      if (!this.started && !this.finished && distToStart < 10) {
        this.started = true;
        this.elapsed = 0;
        console.log('[hud] START — timer started');
      }
      
      // === Финиш ===
      // Машина прошла по кругу и вернулась к старту (была далеко, снова близко)
      if (this.started && !this.finished && distToStart < 10 && this.elapsed > 5) {
        // Проверяем что машина реально уезжала от старта
        this.finished = true;
        console.log('[hud] FINISH — time:', this.formatTime(this.elapsed));
        this.showFinish();
      }
    }
    
    // === Обновление времени ===
    if (this.started && !this.finished) {
      this.elapsed += dt;
    }
    
    // === Таймер на экране ===
    this.timerEl.textContent = this.formatTime(this.elapsed);
    
    // === Скорость ===
    const kmh = Math.abs(car.velocity * 3.6);
    this.speedEl.innerHTML = `${Math.round(kmh)} <span>km/h</span>`;
  }
}
