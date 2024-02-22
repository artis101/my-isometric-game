import { BaseScene } from "../scenes/BaseScene";

export class Spikes extends Phaser.GameObjects.Sprite {
  body!: Phaser.Physics.Arcade.StaticBody;

  constructor(scene: BaseScene, x: number, y: number, width: number, height: number, isTopSpike: boolean) {
    super(scene, x + width / 2, y - height, "atlas", isTopSpike ? "spikes-top.png" : "spikes.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.setDepth(0);

    this.scene.physics.add.collider(scene.player, this, () => {
      scene.player.setHurtStateMs(200);

      if (scene.player.body.touching.down || scene.player.body.touching.up) {
        scene.player.kill();
      }
      // console log for left and right fouches
      if (scene.player.body.touching.left || scene.player.body.touching.right) {
        scene.player.hurt(0.5);
        scene.player.setVelocity(-100, -100);
      }
    });
  }
}
