import { BaseScene } from "../scenes/BaseScene";

export class DisappearingBlock extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  static HEIGHT = 16;
  static WIDTH = 16;

  private initialX: number;
  private initialY: number;

  private isDisappearing = false;
  private disappearThreshold = 300; // milliseconds

  constructor(scene: BaseScene, x: number, y: number, properties: any) {
    super(scene, x + DisappearingBlock.WIDTH / 2, y - DisappearingBlock.HEIGHT, "atlas", "block.png");

    this.initialX = this.x;
    this.initialY = this.y;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.scene.physics.add.collider(this.scene.player, this, this.onPlayerCollide, undefined, this);
    this.setSize(DisappearingBlock.WIDTH, DisappearingBlock.HEIGHT);
    this.setImmovable(true);
    this.setGravity(0);
    this.setMaxVelocity(0, 0);
    this.setMass(5);
    this.setDepth(10);

    const speedProperty = properties.find((p: any) => p.name === "speed");
    const isDisappearingProperty = properties.find((p: any) => p.name === "disappearing");

    this.disappearThreshold = speedProperty ? speedProperty.value : this.disappearThreshold;
    this.isDisappearing = isDisappearingProperty ? isDisappearingProperty.value : false;
  }

  onPlayerCollide(
    _: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    block: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    // fall down after this.disappearThreshold milliseconds after collision
    this.scene.time.delayedCall(this.disappearThreshold, () => {
      this.setMaxVelocity(100);
      this.setVelocityY(100);

      this.scene.tweens.add({
        targets: block,
        alpha: 0,
        duration: 800,
        delay: 500,
        ease: "Power2",
        onComplete: () => {
          if (!this.isDisappearing) {
            this.x = this.initialX;
            this.y = this.initialY;
            this.setMaxVelocity(0);
            this.setAlpha(1);
          } else {
            this.destroy();
          }
        },
      });
    });
  }
}
