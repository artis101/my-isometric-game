import { BaseScene } from "./BaseScene";
import { Player } from "../characters/Player";

export class Level1 extends BaseScene {
  private introText!: Phaser.GameObjects.BitmapText;
  private moveText!: Phaser.GameObjects.BitmapText;
  private interactText!: Phaser.GameObjects.BitmapText;
  private jumpText!: Phaser.GameObjects.BitmapText;
  private treatText!: Phaser.GameObjects.BitmapText;
  private endOfRoad!: Phaser.GameObjects.BitmapText;

  private playerMoved = false;
  private playerJumped = false;
  private playerAteMushroom = false;

  // time when player ate the mushroom
  private playerAteMushroomTime = 0;

  constructor() {
    super("level1");
  }

  setupPlayer() {
    // start of level spawn point
    // this.player = new Player(this, 26, 580, Player.MAX_HIT_POINTS);
    // up the stairs spawn point
    this.player = new Player(this, 1100, 64, 2.5);
    // this.player = new Player(this, 792, 14, Player.MAX_HIT_POINTS);
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

    // intro text
    this.introText = this.add
      .bitmapText(
        16,
        740,
        "atari",
        "Oops, sorry about that fall damage..\nthis is not a professional game.\nIt's okay, I am sure there is something around here to heal you.\n\nSet out to find the treasure!",
        10
      )
      .setDepth(1);

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

    this.endOfRoad = this.add
      .bitmapText(620, 680, "atari", "You made it!\n..but there's nothing on this side.\nGo up", 10)
      .setCenterAlign()
      .setDepth(1);
  }

  update() {
    super.update();

    if (this.playerMoved && this.moveText) {
      this.tweens.add({
        targets: [this.moveText, this.introText],
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
        this.interactText.setText("That mushroom was poisonous..");
      } else if (secondsSincePlayerAteMushroom > 6 && secondsSincePlayerAteMushroom <= 9) {
        this.interactText.setText("..you shouldn't have eaten it..");
      } else if (secondsSincePlayerAteMushroom > 9 && secondsSincePlayerAteMushroom <= 12) {
        this.interactText.setText("Skulls right there didn't give it away?");
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

    if (this.player.getGemCount() >= 1 && this.treatText) {
      this.tweens.add({
        targets: this.treatText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.treatText.destroy();
        },
      });
    }
  }
}
