import { Player } from "../characters/Player";
import { BaseScene } from "../scenes/BaseScene";

export class Overlay {
  // internal UI
  private previousHitPoints = -1;
  private previousGemCount = -1;
  private hpHearts = new Array<Phaser.GameObjects.Sprite>();
  private scene: BaseScene;
  private player: Player;

  constructor(scene: BaseScene) {
    this.scene = scene;
    this.player = scene.player;
    this.hpHearts = new Array<Phaser.GameObjects.Sprite>();
  }

  update() {
    if (this.previousHitPoints !== this.player.getHitpoints()) {
      this.previousHitPoints = this.player.getHitpoints();
      this.updateHearts();
    }

    if (this.previousGemCount !== this.player.getGemCount()) {
      this.previousGemCount = this.player.getGemCount();
      this.updateGemCount();
    }
  }

  private updateHearts() {
    const playerHp = this.player.getHitpoints();

    this.hpHearts.forEach((heart) => heart.destroy());

    // hitpoints are 0.0 to 3.0 in 0.5 increments
    // 0.0 = 0 hearts, 3.0 = 3 hearts, 1.5 = 1 heart and a half, 2.5 = 2 hearts and a half
    const hearts = Math.floor(playerHp);
    const halfHeart = playerHp % 1 !== 0;
    const emptyHearts = 3 - hearts - (halfHeart ? 1 : 0);
    const extraHearts = hearts - 3;

    for (let i = 0; i < Player.MAX_HIT_POINTS; i++) {
      this.hpHearts.push(this.scene.add.sprite(16 + i * 16, 16, "atlas", "ui_heart_full.png").setScrollFactor(0));
    }

    if (halfHeart) {
      this.hpHearts.push(this.scene.add.sprite(16 + hearts * 16, 16, "atlas", "ui_heart_half.png").setScrollFactor(0));
    }

    for (let i = 0; i < emptyHearts; i++) {
      this.hpHearts.push(
        this.scene.add
          .sprite(16 + (hearts + (halfHeart ? 1 : 0) + i) * 16, 16, "atlas", "ui_heart_empty.png")
          .setScrollFactor(0)
      );
    }

    if (extraHearts > 0) {
      for (let i = 0; i < extraHearts; i++) {
        this.hpHearts.push(
          this.scene.add
            .sprite(16 + (hearts + (halfHeart ? 1 : 0) + emptyHearts + i) * 16, 16, "atlas", "ui_heart_full.png")
            .setScrollFactor(0)
        );
      }
    }
  }

  private updateGemCount() {
    const gemCount = this.player.getGemCount();
    this.scene.add.sprite(16, 32, "atlas", "gem-1.png").setScrollFactor(0);
    this.scene.add.bitmapText(28, 34, "atari", `× ${gemCount}`, 12).setScrollFactor(0);
  }
}
