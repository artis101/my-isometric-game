const PLAYER_MOVE_VELOCITY = 160;
const PLAYER_JUMP_VELOCITY = -300;
const PLAYER_MAX_VELOCITY = 500;
const PLAYER_MASS = 10;
const PLAYER_BOUNCE = 0.2;
const PLAYER_HITPOINTS = 3.0;
const FALL_DAMAGE_VELOCITY_THRESHOLD = 350;

type Level1SceneTypeStub = Phaser.Scene & {
  markPlayerMoved: () => void;
  markPlayerJumped: () => void;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private lastVelocityY = 0;

  static MAX_HIT_POINTS = PLAYER_HITPOINTS;

  private hitPoints = PLAYER_HITPOINTS;
  private lastHitTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, hitPoints: number = PLAYER_HITPOINTS) {
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
  }

  private calculateFallDamage(velocity: number) {
    // velocity range is between 400 and 500. Players take damage between 0.5 and 2.5
    // the threshold is 400 when players take 0.5 points of damage and 450 when they take 2.5
    // damage should be dealt in a linear fashion between 400 and 500 in increments of 0.5
    const minDamage = 0.5;
    const maxDamage = 2.5;
    const minVelocity = 400;
    const maxVelocity = 500;
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

  update(keyInput: KeyInputKeys) {
    if (this.isDead()) {
      this.anims.play("hurt", true);
      this.setVelocity(0, 0);
      return;
    } else if (this.isHurting()) {
      this.setVelocity(0, 0);
      this.setTint(0xff8c8c);
      this.anims.play("hurt", true);
      return;
    } else if (this.sustainedFallDamage()) {
      const fallDamage = this.calculateFallDamage(this.lastVelocityY);
      console.log({ fallDamage, lastVelocityY: this.lastVelocityY });

      this.setVelocity(0, 0);
      this.lastVelocityY = 0;

      this.hurt(fallDamage);
      return;
    } else {
      this.clearTint();

      // current scene name
      const sceneName = this.scene.scene.key;

      if (
        sceneName === "level1" &&
        (keyInput.LEFT.isDown || keyInput.RIGHT.isDown || keyInput.UP.isDown || keyInput.SPACE.isDown)
      ) {
        (this.scene as Level1SceneTypeStub).markPlayerMoved();
      }

      if (sceneName === "level1" && (keyInput.SPACE.isDown || keyInput.UP.isDown)) {
        (this.scene as Level1SceneTypeStub).markPlayerJumped();
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
