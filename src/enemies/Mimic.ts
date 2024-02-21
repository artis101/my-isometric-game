import { BaseScene } from "../scenes/BaseScene";

export class Mimic extends Phaser.Physics.Arcade.Sprite {
  public scene!: BaseScene;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x + 8, y, "atlas", "empty/chest_empty_open_anim_f0.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.setImmovable(true);
    this.setDepth(10);
    this.setSize(16, 16);
    this.setOffset(0, 0);
    this.setBounce(0);

    this.scene.anims.create({
      key: "mimic_open",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "mimic/chest_mimic_open_anim_f",
        suffix: ".png",
        start: 1,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.physics.add.overlap(scene.player, this, this.overlap, undefined, this);
  }

  overlap() {
    if (this.scene.keyInput.E.isDown) {
      this.anims.play("mimic_open");

      this.scene.player.kill();
    }
  }
}
