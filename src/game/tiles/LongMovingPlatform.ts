import { BaseScene } from "../scenes/BaseScene";

export class LongMovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private debug = false;

  private moveXnumTiles: number;
  private originalX: number;
  private moveTargetX: number;

  private direction!: "left" | "right";
  private moveXSpeed = 100;

  constructor(scene: BaseScene, x: number, y: number, properties: any) {
    const height = 16;
    super(scene, x + 16, y - 16, "atlas", "platform-long.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.scene.physics.add.collider(this.scene.player, this);
    // fix platform in place
    this.body.setMaxVelocityY(0);
    this.body.immovable = true;
    this.setDepth(10);
    this.body.setSize(32, 16);

    this.originalX = this.x;

    const moveXProperty = properties.find((p: any) => p.name === "moveX");
    // moveX is the amount of tiles the platform should move
    // negative values move left, positive values move right
    this.moveXnumTiles = moveXProperty ? moveXProperty.value : 0;
    this.direction = this.moveXnumTiles > 0 ? "right" : "left";

    this.moveTargetX = this.x + this.moveXnumTiles * 16;

    if (this.direction === "right") {
      this.moveTargetX += 16;
    } else {
      this.moveTargetX -= 16;
    }
    const moveXSpeedProperty = properties.find((p: any) => p.name === "moveXSpeed");
    // moveXSpeed is the velocity the platform should move at
    this.moveXSpeed = moveXSpeedProperty ? moveXSpeedProperty.value : this.moveXSpeed;

    if (this.debug) {
      if (this.moveXnumTiles > 0) {
        this.scene.add.line(this.moveTargetX, y - 8, 0, 0, 0, height, 0xff0000, 0.5).setDepth(100);
        this.scene.add.line(this.originalX - 16, y - 8, 0, 0, 0, height, 0x00ff00, 0.5).setDepth(100);
      } else {
        this.scene.add.line(this.moveTargetX, y - 8, 0, 0, 0, height, 0xff0000, 0.5).setDepth(100);
        this.scene.add.line(this.originalX + 16, y - 8, 0, 0, 0, height, 0x00ff00, 0.5).setDepth(100);
      }
    }
  }

  reverse(right: boolean = true) {
    // console.log(`reversing to the ${right ? "right" : "left"}`);
    this.moveXnumTiles = -this.moveXnumTiles;
  }

  update() {
    // console.log({ x: this.x, moveTargetX: this.moveTargetX, originalX: this.originalX });
    // moving left
    if (this.moveXnumTiles < 0) {
      if (
        (this.direction === "right" && this.x < this.moveTargetX - 16) ||
        (this.direction === "left" && this.x < this.moveTargetX + 16)
      ) {
        this.reverse(); // reverse to the right
      } else {
        // console.log("moving left");
        this.setVelocityX(-this.moveXSpeed);
      }
      // moving right
    } else if (this.moveXnumTiles > 0) {
      if (this.x > this.originalX) {
        this.reverse(false); // reverse to the left
      } else {
        this.setVelocityX(this.moveXSpeed);
      }
    }
  }
}
