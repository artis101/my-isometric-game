const PLAYER_VELOCITY_X = 160;
const PLAYER_VELOCITY_Y = -300;
const PLAYER_MASS = 1;
const PLAYER_BOUNCE = 0.2;
const PLAYER_HITPOINTS = 3.0;
const FALL_DAMAGE_VELOCITY_THRESHOLD = -100;

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

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

  calculateFallDamage(velocity: number) {
    // fall damage is calculated by the velocity of the player when they hit the ground
    // the faster they are falling, the more damage they take
    // maxiumum fall damage is 2.5 hitpoints
    // minimum fall damage is 0.5 hitpoints
    // minimum fall damage velocity is -100
    // maximum fall damage velocity is -300
    // the formula is:
    // fall damage = (velocity - 100) / 50
    // if fall damage is less than 0.5, return 0.5
    // if fall damage is more than 2.5, return 2.5

    const fallDamage = (velocity - 100) / 50;

    return Math.min(Math.max(fallDamage, 0.5), 2.5);
  }

  playerIsDead() {
    return this.hitPoints <= 0;
  }

  playerIsHurting() {
    return this.scene.time.now - this.lastHitTime < 500;
  }

  playerSustainedFallDamage() {
    return this.body.onFloor() && this.body.velocity.y < FALL_DAMAGE_VELOCITY_THRESHOLD;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (this.playerIsDead()) {
      this.anims.play("hurt", true);
      this.setVelocityX(0);
      this.setVelocityY(0);
      return;
    } else if (this.playerIsHurting()) {
      this.setVelocityX(0);
      this.setVelocityY(0);
      this.setTint(0xff8c8c);
      this.anims.play("hurt", true);
      return;
    } else if (this.playerSustainedFallDamage()) {
      const fallDamage = this.calculateFallDamage(this.body.velocity.y);

      this.setVelocityX(0);
      this.setVelocityY(0);

      this.hurt(fallDamage);
      return;
    } else {
      this.clearTint();

      if (cursors.left.isDown) {
        this.setVelocityX(-PLAYER_VELOCITY_X);

        if (this.body.onFloor()) {
          this.anims.play("run", true);
        }
      } else if (cursors.right.isDown) {
        this.setVelocityX(PLAYER_VELOCITY_X);

        if (this.body.onFloor()) {
          this.anims.play("run", true);
        }
      } else {
        this.setVelocityX(0);

        if (this.body.onFloor()) {
          this.anims.play("idle", true);
        }
      }

      if ((cursors.space.isDown || cursors.up.isDown) && this.body.onFloor()) {
        this.setVelocityY(PLAYER_VELOCITY_Y);
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
