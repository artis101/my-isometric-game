import { BaseScene } from "../scenes/BaseScene";

export class Gem extends Phaser.GameObjects.Sprite {
  public scene: BaseScene;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x, y, "atlas", "gem-1.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.scene.physics.add.overlap(scene.player, this, this.collectGem, undefined, this);
    this.setDepth(30);

    if (!this.scene.anims.exists("gem")) {
      this.createAnims();
    }
  }

  private createAnims() {
    this.scene.anims.create({
      key: "gem",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "gem-",
        suffix: ".png",
        start: 1,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  collectGem(
    _: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    gem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    // player consumes it and destroys this gem
    this.scene.player.collectGem(gem as Gem);
  }

  update() {
    this.anims.play("gem", true);
  }
}
