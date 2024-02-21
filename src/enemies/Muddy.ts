import { BaseScene } from "../scenes/BaseScene";

export class Muddy extends Phaser.Physics.Arcade.Sprite {
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private isDead = false;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x + 8, y, "atlas", "muddy_anim_f0.png");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.setCollideWorldBounds(true);
    this.setMass(1);
    this.setDepth(10);
    this.setSize(16, 16);
    this.setOffset(0, 0);
    this.setBounce(0);

    this.scene.anims.create({
      key: "muddy",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "muddy_anim_f",
        suffix: ".png",
        start: 1,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.physics.add.collider(scene.player, this, () => {
      if (this.isDead) {
        this.setVelocity(0);
        return;
      }

      // reverse direction on collision
      if (this.body.velocity.x > 0) {
        this.setVelocityX(-100);
      } else {
        this.setVelocityX(100);
      }

      if (scene.player.body.touching.down) {
        // bounce player up
        scene.player.body.setVelocityY(-200);
        this.setVelocityY(-100);
        this.isDead = true;
      }

      if (scene.player.body.touching.left || scene.player.body.touching.right) {
        scene.player.hurt(0.5);
        scene.player.setHurtStateMs(200);
        if (scene.player.x < this.x) {
          scene.player.setVelocity(-100, -100);
        } else {
          scene.player.setVelocity(100, -100);
        }
      }
    });
  }

  update() {
    if (this.isDead) {
      this.anims.play("enemy-death", true);
      this.setVelocity(0);
      this.setSize(40, 40);

      // tween out if death animation is done
      if (this.anims.currentFrame && this.anims.currentFrame.isLast) {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 100,
          onComplete: () => {
            this.destroy();
          },
        });
      }
    } else {
      this.anims.play("muddy", true);
    }

    // walk back and forth on the platform
    if (this.body.onFloor()) {
      // get the dimensions of the platform we are walking on
      const tileBelow = (this.scene as BaseScene).ground.getTileAtWorldXY(this.x, this.y + 16);

      if (!tileBelow) {
        return;
      }

      const tileBelowToTheRight = (this.scene as BaseScene).ground.getTileAtWorldXY(this.x + 16, this.y + 16);
      const tileBelowToTheLeft = (this.scene as BaseScene).ground.getTileAtWorldXY(this.x - 16, this.y + 16);

      // if we are at the edge of the platform, turn around
      if (tileBelowToTheRight && !tileBelowToTheLeft) {
        this.body.setVelocityX(100);
        this.setFlipX(true);
      } else if (tileBelowToTheLeft && !tileBelowToTheRight) {
        this.body.setVelocityX(-100);
      } else if (!tileBelowToTheLeft && !tileBelowToTheRight) {
        this.body.setVelocityX(0);
      }
    }
  }
}
