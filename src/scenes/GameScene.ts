import Phaser from 'phaser';
import { tg } from '../telegram';

export class GameScene extends Phaser.Scene {
  private car!: Phaser.Physics.Matter.Sprite;
  private cursors!: any;

  constructor() { super('Game'); }

  create() {
    const { width, height } = this.scale;

    // === ТЕСТ: показываем все загруженные текстуры ===
    const keys = ['gravel', 'gravel2', 'gravel3', 'mud', 'rock', 'tarmac', 'grass'];
    let x = 20, y = 60;
    for (const k of keys) {
      if (this.textures.exists(k)) {
        this.add.image(x, y, k).setOrigin(0, 0).setScale(0.3);
        this.add.text(x + 4, y + 4, k, { fontSize: '12px', color: '#fff' });
        x += 120;
        if (x > width - 100) { x = 20; y += 120; }
      }
    }

    // === МАШИНА ===
    const g = this.add.graphics();
    g.fillStyle(0xff4444);
    g.fillRect(-12, -20, 24, 40);
    g.generateTexture('car', 24, 40);
    g.destroy();

    this.car = this.matter.add.sprite(width / 2, height - 200, 'car');
    this.car.setFrictionAir(0.02);
    this.car.setFixedRotation();
    this.car.setDepth(10);

    this.cameras.main.startFollow(this.car);
    this.cursors = this.input.keyboard!.createCursorKeys();

    document.getElementById('btn-regen')?.addEventListener('click', () => {
      tg.haptic('medium');
      this.scene.restart();
    });
  }

  update() {
    const turn = 0.04;
    if (this.cursors.up.isDown) {
      this.car.setVelocity(
        Math.cos(this.car.rotation - Math.PI / 2) * 4,
        Math.sin(this.car.rotation - Math.PI / 2) * 4
      );
    }
    if (this.cursors.left.isDown) this.car.setAngularVelocity(-turn);
    else if (this.cursors.right.isDown) this.car.setAngularVelocity(turn);
    else this.car.setAngularVelocity(0);
  }
}
