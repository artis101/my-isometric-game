import { Player } from "../characters/Player";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { Gem } from "../items/Gem";
import { Shroom } from "../items/Shroom";

export class BaseScene extends Phaser.Scene {
  // game variables
  protected map!: Phaser.Tilemaps.Tilemap;
  public ground!: Phaser.Tilemaps.TilemapLayer;

  // input keyInput
  public keyInput!: KeyInputKeys;

  // camera dolly
  private cameraDolly!: Phaser.Geom.Point;

  // background and middleground for parallax effect
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;

  // characters
  public player!: Player;

  // internal UI
  private hpHearts = new Array<Phaser.GameObjects.Sprite>();

  // items
  private gems!: Phaser.GameObjects.Group;
  private shrooms!: Phaser.GameObjects.Group;

  create() {
    this.setupInput();
    this.setupBackground();
    this.setupLayers();
    this.setupPlayer();
    this.updateUI();
    this.setupPhysics();
    this.setupProps();
    this.setupGems();
    this.setupSpikes();
    this.setupShrooms();
    this.setupAnimations();
    this.setupCamera();
  }

  update() {
    this.player.update(this.keyInput);

    this.background.tilePositionX = this.cameras.main.scrollX * 0.3;
    this.middleground.tilePositionX = this.cameras.main.scrollX * 0.6;

    this.cameraDolly.x = Math.floor(this.player.x);
    this.cameraDolly.y = Math.floor(this.player.y);

    this.updateUI();
  }

  setupInput() {
    if (this.input && this.input.keyboard) {
      const keyInput = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,E");

      this.keyInput = keyInput as KeyInputKeys;
    } else {
      throw new Error("Failed to create input");
    }
  }

  setupBackground() {
    this.background = this.add.tileSprite(0, 0, this.map.width, 0, "background").setOrigin(0, 0);
    this.middleground = this.add.tileSprite(0, 80, GAME_WIDTH, GAME_HEIGHT, "middleground").setOrigin(0, 0);
    // background and middleground are fixed to the camera
    this.background.setScrollFactor(0);
    this.middleground.setScrollFactor(0);
  }

  private getTilesets() {
    const terrainTileset = this.map.addTilesetImage("terrain");

    if (!terrainTileset) {
      throw new Error("Failed to load terrain tileset");
    }

    const propsTileset = this.map.addTilesetImage("props");

    if (!propsTileset) {
      throw new Error("Failed to load props tileset");
    }

    const itemsTileset = this.map.addTilesetImage("items");

    if (!itemsTileset) {
      throw new Error("Failed to load items tileset");
    }

    return [terrainTileset, propsTileset, itemsTileset];
  }

  setupLayers() {
    const tilesets = this.getTilesets();

    const backgroundLayer = this.map.createLayer("Background", tilesets);

    if (!backgroundLayer) {
      throw new Error("Failed to create background layer");
    }

    const ground = this.map.createLayer("Ground", tilesets);

    if (!ground) {
      throw new Error("Failed to create ground layer");
    }

    this.ground = ground;

    ground.setCollisionByProperty({ collides: true });

    const topCollisionTitles = this.map.filterTiles(
      (tile: any) => tile && tile.properties && tile.properties.collidesTop
    );

    if (topCollisionTitles) {
      topCollisionTitles.forEach((tile) => {
        tile.setCollision(false, false, true, false);
      });
    }
  }

  updateUI() {
    const playerHp = this.player.getHitpoints();

    this.hpHearts.forEach((heart) => heart.destroy());

    // hitpoints are 0.0 to 3.0 in 0.5 increments
    // 0.0 = 0 hearts, 3.0 = 3 hearts, 1.5 = 1 heart and a half, 2.5 = 2 hearts and a half
    const hearts = Math.floor(playerHp);
    const halfHeart = playerHp % 1 !== 0;
    const emptyHearts = 3 - hearts - (halfHeart ? 1 : 0);

    for (let i = 0; i < hearts; i++) {
      this.hpHearts.push(this.add.sprite(16 + i * 16, 16, "atlas", "ui_heart_full.png").setScrollFactor(0));
    }

    if (halfHeart) {
      this.hpHearts.push(this.add.sprite(16 + hearts * 16, 16, "atlas", "ui_heart_half.png").setScrollFactor(0));
    }

    for (let i = 0; i < emptyHearts; i++) {
      this.hpHearts.push(
        this.add
          .sprite(16 + (hearts + (halfHeart ? 1 : 0) + i) * 16, 16, "atlas", "ui_heart_empty.png")
          .setScrollFactor(0)
      );
    }
  }

  setupPhysics() {
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.add.collider(this.player, this.ground);
  }

  setupProps() {
    const props = this.map.getObjectLayer("Props");

    if (props) {
      props.objects.forEach((prop) => {
        const { x, y, width, height, type } = prop;

        if (!x || !y || !width || !height) {
          throw new Error("Invalid prop object");
        }

        this.add.sprite(x + width / 2, y - height, "atlas", `${type}.png`);
      });
    }
  }

  setupGems() {
    const gemObjectLayer = this.map.getObjectLayer("Gems");
    this.gems = this.add.group(undefined, {
      classType: Gem,
      runChildUpdate: true,
    });

    if (gemObjectLayer) {
      gemObjectLayer.objects.forEach((tile) => {
        const { x, y, width, height } = tile;

        if (!x || !y || !width || !height) {
          throw new Error("Invalid gem object");
        }

        const gem = new Gem(this, x + width / 2, y - height);
        this.gems.add(gem);
      });
    }
  }

  setupSpikes() {
    // add object layer spikes
    const spikes = this.map.getObjectLayer("Spikes");

    if (spikes) {
      const spikeSprites: Phaser.GameObjects.Sprite[] = [];

      spikes.objects.forEach((spike) => {
        const { x, y, width, height, type } = spike;

        if (!x || !y || !width || !height) {
          throw new Error("Invalid spike object");
        }

        const isTopSpike = type === "spikes-top";

        const spikeSprite = this.add.sprite(
          x + width / 2,
          y - height,
          "atlas",
          isTopSpike ? "spikes-top.png" : "spikes.png"
        );

        const gameSprite = this.physics.add.existing(spikeSprite, true).setDepth(1);
        spikeSprites.push(gameSprite);
      });

      this.physics.add.collider(this.player, spikeSprites, () => {
        // detect if player jumped on top
        if (this.player.body.touching.down || this.player.body.touching.up) {
          this.player.setTint(0xe45350);
          this.game.pause();
        } else {
          // knock back player depending from which side they hit the spike
          if (this.player.body.touching.left) {
            this.player.setVelocityX(-300);
          } else {
            this.player.setVelocityX(300);
          }
        }
      });
    }
  }

  setupShrooms() {
    const shroomObjectLayer = this.map.getObjectLayer("Shrooms");
    this.shrooms = this.add.group(undefined, {
      classType: Shroom,
      runChildUpdate: true,
    });

    if (shroomObjectLayer) {
      shroomObjectLayer.objects.forEach((tile) => {
        const { x, y, width, height } = tile;

        if (!x || !y || !width || !height) {
          throw new Error("Invalid shroom object");
        }

        const shroom = new Shroom(this, x + width / 2, y - height);
        this.shrooms.add(shroom);
      });
    }
  }

  setupPlayer() {
    // const spawnPoint = this.map.findObject("Objects", (obj) => obj.name === "Spawn Point");

    // if (!spawnPoint) {
    //   throw new Error("Failed to find spawn point");
    // }

    // const { x, y } = spawnPoint;

    // if (!x || !y) {
    //   throw new Error("Invalid spawn point");
    // }

    // this.player = new Player(this, x, y);
    throw new Error("Must implement setupPlayer method");
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.ground.width, this.ground.height);

    this.cameraDolly = new Phaser.Geom.Point(this.player.x, this.player.y);
    this.cameras.main.startFollow(this.cameraDolly);
  }

  setupAnimations() {
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "idle/player-idle-",
        suffix: ".png",
        start: 1,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "run/player-run-",
        suffix: ".png",
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "jump/player-jump-",
        suffix: ".png",
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "hurt",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "hurt/player-hurt-",
        suffix: ".png",
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-death",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "enemy-death-",
        suffix: ".png",
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "gem",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "gem-",
        suffix: ".png",
        start: 1,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
