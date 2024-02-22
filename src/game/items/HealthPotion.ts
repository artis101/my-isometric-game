import { BaseScene } from "../scenes/BaseScene";
import { Level1 } from "../scenes/Level1";

export class HealthPotion extends Phaser.GameObjects.Sprite {
  public scene!: BaseScene;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x, y, "atlas", "flask_red.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.scene.physics.add.collider(this, scene.ground);
    this.scene.physics.add.overlap(scene.player, this, this.overlap, undefined, this);
    this.setDepth(30);
  }

  overlap() {
    if (this.scene.keyInput.E.isDown) {
      // current scene name
      const sceneName = this.scene.scene.key;
      // if the current scene is level1
      if (sceneName === "level1") {
        // mark the player as having eaten the mushroom
        // (this.scene as Level1).
      }

      this.scene.player.heal(1);
      this.destroy();
    }
  }
}
