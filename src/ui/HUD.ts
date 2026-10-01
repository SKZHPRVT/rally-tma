import { Car } from '../entities/Car';

export class HUD {
  timerEl: HTMLElement;
  speedEl: HTMLElement;
  elapsed: number = 0;

  constructor() {
    this.timerEl = document.getElementById('timer')!;
    this.speedEl = document.getElementById('speed')!;
  }

  update(dt: number, car: Car) {
    this.elapsed += dt;

    const min = Math.floor(this.elapsed / 60);
    const sec = Math.floor(this.elapsed % 60);
    const ms = Math.floor((this.elapsed % 1) * 100);
    this.timerEl.textContent =
      `${min.toString().padStart(2, '0')}:` +
      `${sec.toString().padStart(2, '0')}.` +
      `${ms.toString().padStart(2, '0')}`;

    const kmh = Math.abs(car.velocity * 3.6);
    this.speedEl.innerHTML = `${Math.round(kmh)} <span>km/h</span>`;
  }
}
