import { BaseScene } from "../scenes/BaseScene";

export class Gem extends Phaser.GameObjects.Sprite {
  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x, y, "atlas", "gem-1.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.scene.physics.add.overlap(scene.player, this, this.collectGem, undefined, this);
    this.setDepth(30);
  }

  collectGem(
    _: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    gem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    gem.destroy();
  }

  update() {
    this.anims.play("gem", true);
  }
}
