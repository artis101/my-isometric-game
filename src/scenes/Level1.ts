import { Player } from "../characters/Player";
import { BaseScene } from "./BaseScene";

export class Level1 extends BaseScene {
  private moveText!: Phaser.GameObjects.BitmapText;
  private interactText!: Phaser.GameObjects.BitmapText;
  private jumpText!: Phaser.GameObjects.BitmapText;
  private treatText!: Phaser.GameObjects.BitmapText;

  private playerMoved = false;
  private playerJumped = false;
  private playerAteMushroom = false;

  // time when player ate the mushroom
  private playerAteMushroomTime = 0;

  constructor() {
    super("level1");
  }

  setupPlayer() {
    // 26, 540 hurts 2.5 roughty 9-10 tiles
    // 26, 560 hurts 2, roughtly 8-9 tiles
    // 26, 570 hurts 1.5, roughly 7-8 tiles
    // 26, 580 hurts 1, roughly 6-7 tiles
    // 26, 600 hurts 0.5, roughly 5-6 tiles
    // 26, 695 is safe, 700 is ground level
    this.player = new Player(this, 26, 695, Player.MAX_HIT_POINTS);
  }

  markPlayerMoved() {
    this.playerMoved = true;
  }

  markPlayerJumped() {
    this.playerJumped = true;
  }

  markPlayerAteMushroom() {
    this.playerAteMushroom = true;
    this.playerAteMushroomTime = this.time.now;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "maps/level1.json");
  }

  create() {
    this.map = this.add.tilemap("map");

    if (!this.map) {
      throw new Error("Failed to load map");
    }

    super.create();

    // set up the tutorial
    this.moveText = this.add.bitmapText(20, 680, "atari", "Move with arrow keys", 10).setCenterAlign().setDepth(1);

    // set up the interact text
    // players can test out interaction and lose some health
    // if they interact with the mushroom, they will be taught
    // that the mushroom is poisonous
    this.interactText = this.add.bitmapText(142, 680, "atari", "Interact with E key", 10).setCenterAlign().setDepth(1);

    this.jumpText = this.add.bitmapText(142, 635, "atari", "Jump with up or space", 10).setCenterAlign().setDepth(1);
    this.treatText = this.add
      .bitmapText(390, 695, "atari", "Have a treat for following instructions", 10)
      .setCenterAlign();
  }

  update() {
    super.update();

    if (this.playerMoved && this.moveText) {
      this.tweens.add({
        targets: this.moveText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.moveText.destroy();
        },
      });
    }

    if (this.playerJumped && this.jumpText) {
      this.tweens.add({
        targets: this.jumpText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.jumpText.destroy();
        },
      });
    }

    if (this.playerAteMushroom) {
      const secondsSincePlayerAteMushroom = (this.time.now - this.playerAteMushroomTime) / 1000;

      // show first message for 3 seconds
      if (secondsSincePlayerAteMushroom <= 3) {
        this.interactText.setText("Good job! You followed instructions!..");
      } else if (secondsSincePlayerAteMushroom > 3 && secondsSincePlayerAteMushroom <= 6) {
        this.interactText.setText("The mushroom is poisonous though..");
      } else if (secondsSincePlayerAteMushroom > 6 && secondsSincePlayerAteMushroom <= 9) {
        this.interactText.setText("..you should not eat it..");
      } else if (secondsSincePlayerAteMushroom > 9 && secondsSincePlayerAteMushroom <= 12) {
        this.interactText.setText("Didn't you see the skulls?");
      } else if (secondsSincePlayerAteMushroom > 12) {
        // tween out the text
        this.tweens.add({
          targets: this.interactText,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.interactText.destroy();
          },
        });
      }
    }
  }
}
