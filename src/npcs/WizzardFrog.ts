import { BaseScene } from "../game/scenes/BaseScene";

export type WizzardSize = "small" | "large" | "giant";

const BASE_WIDTH = 35;
const BASE_HEIGHT = 32;

export class WizzardFrog extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;

  public body!: Phaser.Physics.Arcade.Body;

  // character state props
  private size: WizzardSize = "small";

  private numPlayerJumpsOnFrog = 0;

  constructor(scene: BaseScene, x: number, y: number, size: WizzardSize = "small") {
    super(scene, x + BASE_WIDTH - BASE_WIDTH / 3, y - BASE_HEIGHT / 2, "atlas", "idle/frog-idle-1.png");
    this.size = size;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.setCollideWorldBounds(true);
    this.setMass(100);
    this.setOffset(0, 0);
    this.setDepth(10);
    this.setBounce(0);
    this.setPushable(false);

    const frogFrameNames = this.anims.generateFrameNames("atlas", {
      prefix: "idle/frog-idle-",
      suffix: ".png",
      start: 1,
      end: 4,
    });

    this.anims.create({
      key: "frog-idle",
      frames: [...frogFrameNames, ...frogFrameNames.reverse()],
      frameRate: 4,
      repeat: -1,
      delay: 2000,
      showBeforeDelay: true,
      repeatDelay: 3000,
    });
    this.setSize(BASE_WIDTH - 4, BASE_HEIGHT - 10);

    this.switchSize(this.size);

    // collide with player
    this.scene.physics.add.collider(this.scene.player, this, this.handlePlayerCollision, undefined, this);
  }

  private switchSize(size: WizzardSize) {
    switch (size) {
      case "small":
        this.scene.tweens.add({
          targets: this,
          scale: 1,
          duration: 1000,
          ease: "Bounce",
        });
        break;
      case "large":
        this.scene.tweens.add({
          targets: this,
          scale: 2,
          duration: 1000,
          ease: "Bounce",
        });
        break;
      case "giant":
        this.scene.tweens.add({
          targets: this,
          scale: 4,
          duration: 1000,
          ease: "Bounce",
        });
        break;
    }
  }

  private handlePlayerCollision() {
    // if player jumped on top
    if (this.scene.player.body.touching.down) {
      this.numPlayerJumpsOnFrog++;
      this.scene.player.setHurtStateMs(200);
      this.scene.player.setVelocity(-500, -200);
      this.setVelocityY(-100);

      if (this.numPlayerJumpsOnFrog === 1) {
        this.switchSize("large");
      } else if (this.numPlayerJumpsOnFrog === 2) {
        this.switchSize("giant");
      }
    }
  }

  update() {
    this.anims.play("frog-idle", true);
    this.setVelocityX(0);
  }
}
