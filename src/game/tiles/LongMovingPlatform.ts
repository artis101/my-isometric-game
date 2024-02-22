import { BaseScene } from "../scenes/BaseScene";

export class LongMovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private moveXnumTiles: number;
  private originalX: number;
  private moveTargetX: number;

  constructor(scene: BaseScene, x: number, y: number, width: number, height: number, properties: any) {
    super(scene, x + width / 2, y - height, "atlas", "platform-long.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.scene.physics.add.collider(this.scene.player, this);
    this.body.setMaxVelocity(50, 0);
    this.setMass(1);
    // fix platform in place
    this.body.immovable = true;
    this.setDepth(10);
    this.body.setSize(width, height);
    this.body.setOffset(0, 0);

    this.originalX = x;

    const moveXProperty = properties.find((p: any) => p.name === "moveX");
    // moveX is the amount of tiles the platform should move
    // negative values move left, positive values move right
    this.moveXnumTiles = moveXProperty ? moveXProperty.value : 0;
    this.moveTargetX = this.x + this.moveXnumTiles * 16;

    this.scene.add.rectangle(this.originalX + 8, y - 8, 16, 16, 0x00ff00, 0.5).setDepth(100);
    this.scene.add.rectangle(this.moveTargetX - 8, y - 8, 16, 16, 0xff0000, 0.5).setDepth(100);

    console.log("moveX", this.moveXnumTiles);
    console.log("moveTargetX", this.moveTargetX);
  }

  reverse(right: boolean = true) {
    console.log(`reversing to the ${right ? "right" : "left"}`);
    this.moveXnumTiles = -this.moveXnumTiles;
    this.setVelocityX(0);
    this.setVelocityX(right ? 50 : -50);
  }

  update() {
    const x = Math.floor(this.x);

    // moving left
    if (this.moveXnumTiles < 0 && x >= this.moveTargetX) {
      if (x === this.moveTargetX) {
        this.reverse(); // reverse to the right
      } else {
        console.log("moving left");
        this.setVelocityX(-50);
      }
      // moving right
    } else if (this.moveXnumTiles > 0 && x <= this.originalX) {
      if (x === this.originalX) {
        this.reverse(false); // reverse to the left
      } else {
        console.log("moving right");
        this.setVelocityX(50);
      }
    }
  }
}
