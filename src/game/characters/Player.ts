import { Gem } from "../items/Gem";
import { BaseScene } from "../scenes/BaseScene";

const PLAYER_MOVE_VELOCITY = 160;
const PLAYER_JUMP_VELOCITY = -300;
const PLAYER_MAX_VELOCITY = 800;
const PLAYER_MASS = 10;
const PLAYER_BOUNCE = 0.2;
const PLAYER_HITPOINTS = 3.0;
const FALL_DAMAGE_VELOCITY_THRESHOLD = 400;

type Level1SceneTypeStub = Phaser.Scene & {
  markPlayerMoved: () => void;
  markPlayerJumped: () => void;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  public scene: BaseScene;

  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private lastVelocityY = 0;
  private enableGravityTime = 0;

  static MAX_HIT_POINTS = PLAYER_HITPOINTS;

  private lastHitTime = 0;
  private hitPoints = PLAYER_HITPOINTS;
  private gemCount = 0;

  private vision!: Phaser.GameObjects.Image;

  constructor(scene: BaseScene, x: number, y: number, hitPoints: number = PLAYER_HITPOINTS) {
    super(scene, x, y, "atlas", "idle/player-idle-1.png");

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, false);
    this.setBounce(PLAYER_BOUNCE);
    this.setMass(PLAYER_MASS);
    this.setMaxVelocity(PLAYER_MAX_VELOCITY, PLAYER_MAX_VELOCITY);
    this.setCollideWorldBounds(true);
    this.body.setSize(16, 24);
    this.body.setOffset(16, 8);
    this.setDepth(10);
    this.hitPoints = hitPoints;

    this.vision = this.scene.make.image({
      x: this.x,
      y: this.y,
      key: "vision",
      add: false,
    });
    this.vision.scale = 0.2;

    const mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.vision);

    this.scene.hidden.setMask(mask);
    mask.invertAlpha = true;

    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNames("atlas", {
        prefix: "idle/player-idle-",
        suffix: ".png",
        start: 1,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "run",
      frames: this.scene.anims.generateFrameNames("atlas", {
        prefix: "run/player-run-",
        suffix: ".png",
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump",
      frames: this.scene.anims.generateFrameNames("atlas", {
        prefix: "jump/player-jump-",
        suffix: ".png",
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "hurt",
      frames: this.scene.anims.generateFrameNames("atlas", {
        prefix: "hurt/player-hurt-",
        suffix: ".png",
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });
  }

  public getHitpoints() {
    return this.hitPoints;
  }

  public heal(amount: number) {
    this.hitPoints = Math.min(this.hitPoints + amount, Player.MAX_HIT_POINTS);
  }

  public hurt(amount: number) {
    this.lastHitTime = this.scene.time.now;
    this.hitPoints = Math.max(this.hitPoints - amount, 0);
    this.blink();
  }

  public kill() {
    this.lastHitTime = this.scene.time.now;
    this.hitPoints = 0;
  }

  private blink() {
    // tween blink player
    this.setTint(0xff8c8c);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  private calculateFallDamage(velocity: number) {
    // velocity range is between 400 and 500. Players take damage between 0.5 and 2.5
    // the threshold is 400 when players take 0.5 points of damage and 450 when they take 2.5
    // damage should be dealt in a linear fashion between 400 and 500 in increments of 0.5
    const minDamage = 0.5;
    const maxDamage = 2.5;
    const minVelocity = FALL_DAMAGE_VELOCITY_THRESHOLD;
    const maxVelocity = PLAYER_MAX_VELOCITY;
    const damagePerUnit = (maxDamage - minDamage) / (maxVelocity - minVelocity);
    const damage = minDamage + (velocity - minVelocity) * damagePerUnit;
    // rounded damage should be a multiple of 0.5
    const roundedDamage = Math.round(damage * 2) / 2;
    return roundedDamage;
  }

  public isDead() {
    return this.hitPoints <= 0;
  }

  public isHurting() {
    return this.scene.time.now - this.lastHitTime < 500;
  }

  private sustainedFallDamage() {
    if (this.body.onFloor() && this.lastVelocityY && this.lastVelocityY > FALL_DAMAGE_VELOCITY_THRESHOLD) {
      return true;
    } else {
      this.lastVelocityY = this.body.velocity.y;
    }
  }

  public getGemCount() {
    return this.gemCount;
  }

  public collectGem(gem: Gem) {
    this.gemCount++;
    gem.destroy();
  }

  public setHurtStateMs(timeout: number = 500) {
    this.enableGravityTime = this.scene.time.now + timeout;
  }

  public enableGravity() {
    this.enableGravityTime = 0;
  }

  update(keyInput: KeyInputKeys) {
    // move the vision mask with the player
    this.vision.x = this.x;
    this.vision.y = this.y;

    if (this.enableGravityTime) {
      if (this.scene.time.now > this.enableGravityTime) {
        this.enableGravity();
      } else {
        this.anims.play("hurt", true);
        return;
      }
    }

    if (this.isDead()) {
      this.anims.play("hurt", true);
      this.setVelocity(0, 0);
      this.body.setImmovable(true);
    } else if (this.isHurting()) {
      this.anims.play("hurt", true);
      this.setVelocity(0, 0);
    } else if (this.sustainedFallDamage()) {
      const fallDamage = this.calculateFallDamage(this.lastVelocityY);

      if (fallDamage > 0) {
        this.setVelocity(0, 0);
        this.lastVelocityY = 0;

        this.hurt(fallDamage);
      }
    } else {
      this.clearTint();

      // current scene name
      const sceneName = this.scene.scene.key;

      if (
        sceneName === "level1" &&
        (keyInput.LEFT.isDown || keyInput.RIGHT.isDown || keyInput.UP.isDown || keyInput.SPACE.isDown)
      ) {
        (this.scene as unknown as Level1SceneTypeStub).markPlayerMoved();
      }

      if (sceneName === "level1" && (keyInput.SPACE.isDown || keyInput.UP.isDown)) {
        (this.scene as unknown as Level1SceneTypeStub).markPlayerJumped();
      }

      if (keyInput.LEFT.isDown) {
        this.setVelocityX(-PLAYER_MOVE_VELOCITY);

        if (this.body.onFloor()) {
          this.anims.play("run", true);
        }
      } else if (keyInput.RIGHT.isDown) {
        this.setVelocityX(PLAYER_MOVE_VELOCITY);

        if (this.body.onFloor()) {
          this.anims.play("run", true);
        }
      } else {
        this.setVelocityX(0);

        if (this.body.onFloor()) {
          this.anims.play("idle", true);
        }
      }

      if ((keyInput.SPACE.isDown || keyInput.UP.isDown) && this.body.onFloor()) {
        this.setVelocityY(PLAYER_JUMP_VELOCITY);
        this.anims.play("jump", true);
      }

      if (this.body.velocity.x > 0) {
        this.setFlipX(false);
      } else if (this.body.velocity.x < 0) {
        this.setFlipX(true);
      }
    }
  }
}
