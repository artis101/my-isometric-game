import { Overlay } from "../UI/Overlay";
import { Player } from "../characters/Player";
import { GAME_HEIGHT, GAME_WIDTH } from "../../constants";
import { HealthPotion } from "../items/HealthPotion";
import { BigHealthPotion } from "../items/BigHealthPotion";
import { Gem } from "../items/Gem";
import { Shroom } from "../items/Shroom";
import { Spikes } from "../items/Spikes";
import { Muddy } from "../enemies/Muddy";
import { Mimic } from "../enemies/Mimic";
import { LongMovingPlatform } from "../tiles/LongMovingPlatform";
import { DisappearingBlock } from "../tiles/DisappearingBlock";

export class BaseScene extends Phaser.Scene {
  // game variables
  protected map!: Phaser.Tilemaps.Tilemap;
  private overlay!: Overlay;

  // layers and tiles
  public ground!: Phaser.Tilemaps.TilemapLayer;
  public hidden!: Phaser.Tilemaps.TilemapLayer;
  private passThroughRightTiles!: Phaser.Tilemaps.Tile[];

  // input keyInput
  public keyInput!: KeyInputKeys;

  // camera dolly
  private cameraDolly!: Phaser.Geom.Point;

  // background and middleground for parallax effect
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;

  // moving platforms
  private movingPlatforms!: Phaser.GameObjects.Group;

  // characters
  public player!: Player;

  // enemy groups
  private enemies!: Phaser.GameObjects.Group;

  // items
  private gems!: Phaser.GameObjects.Group;
  private shrooms!: Phaser.GameObjects.Group;
  private healthItems!: Phaser.GameObjects.Group;
  protected wizzardSprite!: Phaser.GameObjects.Sprite;

  create() {
    this.setupInput();
    this.setupBackground();
    this.setupLayers();
    this.setupPlayer();
    this.setupOverlay();
    // these all are asset based
    this.setupProps();
    // enemies is an object layer in Tiled
    this.setupMovingPlatforms();
    this.setupDisappearingBlocks();
    this.setupEnemies();
    this.setupGems();
    this.setupSpikes();
    this.setupShrooms();
    this.setupHealthItems();
    this.setupWizzardBoss();
    // this forms collisions
    this.setupPhysics();
    // final touches
    this.setupAnimations();
    // this is to avoid camera jitter
    this.setupCamera();
  }

  update() {
    this.player.update(this.keyInput);

    this.background.tilePositionX = this.cameras.main.scrollX * 0.3;
    this.middleground.tilePositionX = this.cameras.main.scrollX * 0.6;

    this.cameraDolly.x = Math.floor(this.player.x);
    this.cameraDolly.y = Math.floor(this.player.y);

    this.overlay.update();

    //  Custom tile overlap check
    this.physics.world.overlapTiles(
      this.player,
      this.passThroughRightTiles,
      (player, tile) => {
        // @ts-ignore
        if (tile.properties && tile.properties.passThroughRight) {
          (player as Player).setVelocityX(-200);
        }
      },
      undefined,
      this
    );
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

    const passThroughRightTiles = this.ground.filterTiles(
      (tile: any) => tile && tile.properties && tile.properties.passThroughRight
    );

    if (passThroughRightTiles) {
      this.passThroughRightTiles = passThroughRightTiles;

      passThroughRightTiles.forEach((tile) => {
        tile.setCollision(true, false, true, true);
      });
    }

    const hidden = this.map.createLayer("Hidden", tilesets);

    if (!hidden) {
      throw new Error("Failed to create hidden layer");
    }

    this.hidden = hidden;
    this.hidden.setDepth(20);
    this.hidden.setAlpha(1);
  }

  setupOverlay() {
    this.overlay = new Overlay(this);
  }

  setupPhysics() {
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.enemies, this.ground);
  }

  setupProps() {
    const props = this.map.getObjectLayer("Props");

    if (props) {
      props.objects.forEach((prop) => {
        const { x, y, width, height, type } = prop;

        if ((!x && x !== 0) || !y || !width || !height) {
          throw new Error("Invalid prop object");
        }

        this.add.sprite(x + width / 2, y - height, "atlas", `${type}.png`);
      });
    }
  }

  setupMovingPlatforms() {
    const movingPlatforms = this.map.getObjectLayer("Moving platforms");

    if (movingPlatforms) {
      this.movingPlatforms = this.add.group(undefined, {
        classType: Gem,
        runChildUpdate: true,
      });

      movingPlatforms.objects.forEach((platform) => {
        // @ts-ignore
        const { x, y, width, height, type, properties } = platform;

        if ((!x && x !== 0) || !y || !width || !height) {
          throw new Error("Invalid movable platform object");
        }

        switch (type) {
          case "platform-long":
            this.movingPlatforms.add(new LongMovingPlatform(this, x, y, properties));
            break;
          case "platform-short":
            // new ShortMovingPlatform(this, x, y, width, height, properties);
            break;
          default:
            throw new Error(`Unknown movable platform type: ${type}`);
        }
      });
    }
  }

  setupDisappearingBlocks() {
    const disappearingBlocks = this.map.getObjectLayer("Disappearing blocks");

    if (disappearingBlocks) {
      disappearingBlocks.objects.forEach((block) => {
        const { x, y, properties } = block;

        if ((!x && x !== 0) || !y) {
          throw new Error("Invalid disappearing block object");
        }

        if (!properties) {
          throw new Error("Disappearing block missing properties");
        }

        new DisappearingBlock(this, x, y, properties);
      });
    }
  }

  setupEnemies() {
    const enemies = this.map.getObjectLayer("Enemies");

    if (enemies) {
      this.enemies = this.add.group(undefined, {
        classType: Muddy,
        runChildUpdate: true,
      });

      enemies.objects.forEach((enemy) => {
        const { x, y, type } = enemy;

        if ((!x && x !== 0) || !y) {
          throw new Error("Invalid enemy object");
        }

        if (!type) {
          throw new Error("Enemy object missing type!");
        }

        switch (type) {
          case "mimic":
            this.enemies.add(new Mimic(this, x, y));
            break;
          case "muddy":
            this.enemies.add(new Muddy(this, x, y));
            break;
          default:
            throw new Error(`Unknown enemy type: ${type}`);
        }
      });
    }
  }

  setupGems() {
    const gemObjectLayer = this.map.getObjectLayer("Gems");

    if (gemObjectLayer) {
      this.gems = this.add.group(undefined, {
        classType: Gem,
        runChildUpdate: true,
      });
      gemObjectLayer.objects.forEach((tile) => {
        const { x, y, width, height } = tile;

        if ((!x && x !== 0) || !y || !width || !height) {
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
      spikes.objects.forEach((spike) => {
        const { x, y, width, height, type } = spike;

        if ((!x && x !== 0) || !y || !width || !height) {
          throw new Error("Invalid spike object");
        }

        const isTopSpike = type === "spikes-top";

        new Spikes(this, x, y, width, height, isTopSpike);
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

        if ((!x && x !== 0) || !y || !width || !height) {
          throw new Error("Invalid shroom object");
        }

        const shroom = new Shroom(this, x + width / 2, y - height);
        this.shrooms.add(shroom);
      });
    }
  }

  setupHealthItems() {
    const healthItemObjectLayer = this.map.getObjectLayer("Health items");
    this.healthItems = this.add.group(undefined, {
      classType: Shroom,
      runChildUpdate: true,
    });

    if (healthItemObjectLayer) {
      healthItemObjectLayer.objects.forEach((tile) => {
        const { x, y, width, height, type } = tile;

        if ((!x && x !== 0) || !y || !width || !height) {
          throw new Error("Invalid healthItem object");
        }

        if (type === "small-health-potion") {
          const healthItem = new HealthPotion(this, x + width / 2, y - height);
          this.healthItems.add(healthItem);
        } else if (type === "big-health-potion") {
          const healthItem = new BigHealthPotion(this, x + width / 2, y - height);
          this.healthItems.add(healthItem);
        }
      });
    }
  }

  setupWizzardBoss() {
    // add object layer spikes
    const wizzard = this.map.getObjectLayer("Wizzard");

    if (wizzard) {
      const objectImageProps = wizzard.objects[0];

      const { x, y, width, height } = objectImageProps;

      if ((!x && x !== 0) || !y || !width || !height) {
        throw new Error("Invalid spike object");
      }

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
        delay: 3000,
        showBeforeDelay: true,
        repeatDelay: 5000,
      });

      // scale 2 (initial) size
      // this.wizzardSprite = this.add.sprite(x + 32, y - 38, "atlas", "idle/frog-idle-1.png");
      // this.wizzardSprite.setScale(2);
      // scale 4 (final) size
      this.wizzardSprite = this.add.sprite(x + 48, y - 92, "atlas", "idle/frog-idle-1.png");
      this.wizzardSprite.setScale(4);

      this.wizzardSprite.setOrigin(0, 0);
    }
  }

  setupPlayer() {
    // todo later
    // const spawnPoint = this.map.findObject("Objects", (obj) => obj.name === "Spawn Point");

    // if (!spawnPoint) {
    //   throw new Error("Failed to find spawn point");
    // }

    // const { x, y } = spawnPoint;

    // if ((!x && x !== 0) || !y) {
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
      key: "enemy-death",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "enemy-death-",
        suffix: ".png",
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: 0,
    });
  }
}
