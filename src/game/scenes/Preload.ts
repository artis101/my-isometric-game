export class Preload extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    this.load.multiatlas("atlas", "sprites/atlas.json", "sprites/");
    this.load.image("terrain", "sprites/atlas-terrain.png");
    this.load.image("props", "sprites/atlas-props.png");
    this.load.image("items", "sprites/atlas-items.png");
    this.load.image("ui", "sprites/atlas-ui.png");
    this.load.image("background", "assets/back.png");
    this.load.image("middleground", "assets/middle.png");
    this.load.image("vision", "masks/Mask-610x343.png");
    this.load.bitmapFont("atari", "fonts/gem.png", "fonts/gem.xml");
  }

  create() {
    this.scene.start("level1");
  }
}
