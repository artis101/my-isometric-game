import { BaseScene } from "../scenes/BaseScene";

export class Shroom extends Phaser.GameObjects.Sprite {
  public scene!: BaseScene;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x, y, "atlas", "shrooms.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.scene.physics.add.collider(this, scene.ground);
    this.scene.physics.add.overlap(scene.player, this, this.overlap, undefined, this);
    this.setDepth(30);
  }

  overlap() {
    if (this.scene.cursors.down.isDown) {
      this.scene.player.hurt(1.5);
      this.destroy();
    }
  }
}
