import { BaseScene } from "../scenes/BaseScene";

export class LongMovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  static HEIGHT = 16;
  static WIDTH = 32;

  private debug = true;

  private originalY: number;
  private moveYnumTiles: number | undefined;
  private moveTargetY: number | undefined;

  private originalX: number;
  private moveXnumTiles: number | undefined;
  private moveTargetX: number | undefined;

  private movementDirection!: "left" | "right" | "up" | "down";
  private moveXSpeed = 100;
  private moveYSpeed = 100;

  constructor(scene: BaseScene, x: number, y: number, properties: any) {
    super(scene, x + LongMovingPlatform.WIDTH / 2, y - LongMovingPlatform.HEIGHT, "atlas", "platform-long.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.scene.physics.add.collider(this.scene.player, this);
    this.body.immovable = true;
    this.setDepth(10);
    this.body.setSize(LongMovingPlatform.WIDTH, LongMovingPlatform.HEIGHT);

    this.originalX = this.x;
    this.originalY = this.y;

    const moveXProperty = properties.find((p: any) => p.name === "moveX");
    const moveXSpeedProperty = properties.find((p: any) => p.name === "moveXSpeed");

    const moveYProperty = properties.find((p: any) => p.name === "moveY");
    const moveYSpeedProperty = properties.find((p: any) => p.name === "moveYSpeed");

    // horizontal movement
    if (moveXProperty) {
      // fix platform in place
      this.body.setMaxVelocity(400, 0);
      // the amount of tiles the platform should move
      // negative values move left, positive values move right
      this.moveXnumTiles = moveXProperty.value;
      // moveXSpeed is the velocity the platform should move at
      this.moveXSpeed = moveXSpeedProperty ? moveXSpeedProperty.value : this.moveXSpeed;
      this.setupHorizontalMovement();
    } else if (moveYProperty) {
      this.body.setMaxVelocity(0, 400);
      // vertical movement
      this.moveYnumTiles = moveYProperty.value;
      this.moveYnumTiles = moveYProperty.value;
      this.moveYSpeed = moveYSpeedProperty ? moveYSpeedProperty.value : this.moveYSpeed;
      this.setupVerticalMovement();
    } else {
      throw new Error("LongMovingPlatform requires either moveX or moveY property");
    }
  }

  setupHorizontalMovement() {
    this.movementDirection = this.moveXnumTiles! > 0 ? "right" : "left";

    this.moveTargetX = this.x + this.moveXnumTiles! * 16;

    if (this.movementDirection === "right") {
      this.moveTargetX += 16;
    } else {
      this.moveTargetX -= 16;
    }

    if (this.debug) {
      if (this.moveXnumTiles! > 0) {
        this.scene.add
          .line(
            this.moveTargetX,
            this.y + LongMovingPlatform.HEIGHT / 2,
            0,
            0,
            0,
            LongMovingPlatform.HEIGHT,
            0xff0000,
            0.5
          )
          .setDepth(100);
        this.scene.add
          .line(
            this.originalX - LongMovingPlatform.HEIGHT,
            this.y + LongMovingPlatform.HEIGHT / 2,
            0,
            0,
            0,
            LongMovingPlatform.HEIGHT,
            0x00ff00,
            0.5
          )
          .setDepth(100);
      } else {
        this.scene.add
          .line(
            this.moveTargetX,
            this.y + LongMovingPlatform.HEIGHT / 2,
            0,
            0,
            0,
            LongMovingPlatform.HEIGHT,
            0xff0000,
            0.5
          )
          .setDepth(100);
        this.scene.add
          .line(
            this.originalX + LongMovingPlatform.HEIGHT,
            this.y + LongMovingPlatform.HEIGHT / 2,
            0,
            0,
            0,
            LongMovingPlatform.HEIGHT,
            0x00ff00,
            0.5
          )
          .setDepth(100);
      }
    }
  }

  setupVerticalMovement() {
    this.movementDirection = this.moveYnumTiles! > 0 ? "up" : "down";

    this.moveTargetY = this.y + this.moveYnumTiles! * 16;

    if (this.movementDirection === "down") {
      this.moveTargetY += 16;
    } else {
      this.moveTargetY -= 16;
    }

    if (this.debug) {
      this.scene.add.line(this.x, this.originalY, 0, 0, LongMovingPlatform.WIDTH, 0, 0x00ff00, 0.5).setDepth(100);
      if (this.moveYnumTiles! > 0) {
        this.scene.add
          .line(this.x, this.moveTargetY + LongMovingPlatform.HEIGHT, 0, 0, LongMovingPlatform.WIDTH, 0, 0xff0000, 0.5)
          .setDepth(100);
      } else {
        this.scene.add
          .line(this.x, this.moveTargetY - LongMovingPlatform.HEIGHT, 0, 0, LongMovingPlatform.WIDTH, 0, 0xff0000, 0.5)
          .setDepth(100);
      }
    }
  }

  reverseHorizontal() {
    this.moveXnumTiles = -this.moveXnumTiles!;
  }

  reverseVertical() {
    this.moveYnumTiles = -this.moveYnumTiles!;
  }

  update() {
    if (this.movementDirection === "left" || this.movementDirection === "right") {
      this.handleHorizontalMovement();
    } else if (this.movementDirection === "up" || this.movementDirection === "down") {
      this.handleVerticalMovement();
    }
  }

  handleHorizontalMovement() {
    if (this.moveXnumTiles! < 0) {
      this.handleLeftHorizontalMovement();
      // moving right
    } else if (this.moveXnumTiles! > 0) {
      this.handleRightHorizontalMovement();
    }
  }

  handleLeftHorizontalMovement() {
    // moving left
    if (
      (this.movementDirection === "right" && this.x < this.moveTargetX! - 16) ||
      (this.movementDirection === "left" && this.x < this.moveTargetX! + 16)
    ) {
      this.reverseHorizontal(); // reverse to the right
    } else {
      // console.log("moving left");
      this.setVelocityX(-this.moveXSpeed);
    }
  }

  handleRightHorizontalMovement() {
    if (this.x > this.originalX) {
      this.reverseHorizontal(); // reverse to the left
    } else {
      this.setVelocityX(this.moveXSpeed);
    }
  }

  handleVerticalMovement() {
    console.log({
      moveYnumTiles: this.moveYnumTiles,
      y: this.y,
      moveTargetY: this.moveTargetY,
    });

    if (this.moveYnumTiles! > 0) {
      console.log("moving up");
      this.handleUpVerticalMovement();
      // moving down
    } else if (this.moveYnumTiles! < 0) {
      console.log("moving down");
      this.handleDownVerticalMovement();
    }
  }

  handleUpVerticalMovement() {
    if (this.y < this.originalY) {
      this.reverseVertical(); // reverse to the left
    } else {
      this.setVelocityY(-this.moveYSpeed);
    }
  }

  handleDownVerticalMovement() {
    if (this.y > this.moveTargetY!) {
      this.reverseVertical(); // reverse to the left
    } else {
      this.setVelocityY(this.moveYSpeed);
    }
  }
}
