import { BaseScene } from "./BaseScene";

export class Level1 extends BaseScene {
  constructor() {
    super("level1");
    this.PLAYER_HP = 2;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "maps/level1.json");
  }

  create() {
    this.map = this.add.tilemap("map");

    if (!this.map) {
      throw new Error("Failed to load map");
    }

    super.create();

    // set up the tutorial
    const moveText = this.add.bitmapText(20, 205, "atari", "Move with arrow keys", 10).setCenterAlign().setDepth(1);
    const interactText = this.add
      .bitmapText(142, 210, "atari", "Interact with down arrow", 10)
      .setCenterAlign()
      .setDepth(1);
    const jumpText = this.add.bitmapText(142, 165, "atari", "Jump with up or space", 10).setCenterAlign().setDepth(1);
    const treatText = this.add
      .bitmapText(390, 205, "atari", "Have a treat for following instructions", 10)
      .setCenterAlign();
  }
}
