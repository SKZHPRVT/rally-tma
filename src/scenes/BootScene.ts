import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.image('gravel',  'assets/cmr/track/gravel1.png');
    this.load.image('gravel2', 'assets/cmr/track/gravel2.png');
    this.load.image('gravel3', 'assets/cmr/track/gravel3.png');
    this.load.image('mud',     'assets/cmr/track/mud1.png');
    this.load.image('rock',    'assets/cmr/track/rock1.png');
    this.load.image('tarmac',  'assets/cmr/track/tarmac1.png');
    this.load.image('grass',   'assets/cmr/track/grass1.png');
    this.load.image('sky',     'assets/cmr/sky/sky_aus.png');
  }
  create() {
    this.scene.start('Game');
  }
}
