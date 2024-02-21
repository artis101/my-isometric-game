import { Overlay } from "../UI/Overlay";
import { Player } from "../characters/Player";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { HealthPotion } from "../items/HealthPotion";
import { BigHealthPotion } from "../items/BigHealthPotion";
import { Gem } from "../items/Gem";
import { Shroom } from "../items/Shroom";
import { Spikes } from "../items/Spikes";
import { Muddy } from "../enemies/Muddy";

export class BaseScene extends Phaser.Scene {
  // game variables
  protected map!: Phaser.Tilemaps.Tilemap;
  public ground!: Phaser.Tilemaps.TilemapLayer;
  private overlay!: Overlay;

  // input keyInput
  public keyInput!: KeyInputKeys;

  // camera dolly
  private cameraDolly!: Phaser.Geom.Point;

  // background and middleground for parallax effect
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;

  // characters
  public player!: Player;

  // enemy groups
  private enemies!: Phaser.GameObjects.Group;

  // items
  private gems!: Phaser.GameObjects.Group;
  private shrooms!: Phaser.GameObjects.Group;
  private healthItems!: Phaser.GameObjects.Group;

  create() {
    this.setupInput();
    this.setupBackground();
    this.setupLayers();
    this.setupPlayer();
    this.setupOverlay();
    // these all are asset based
    this.setupProps();
    // enemies is an object layer in Tiled
    this.setupEnemies();
    this.setupGems();
    this.setupSpikes();
    this.setupShrooms();
    this.setupHealthItems();
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

    const hidden = this.map.createLayer("Hidden", tilesets);

    if (!hidden) {
      throw new Error("Failed to create hidden layer");
    }

    hidden.setDepth(20);
    hidden.setAlpha(1);
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

        if (!x || !y || !width || !height) {
          throw new Error("Invalid prop object");
        }

        this.add.sprite(x + width / 2, y - height, "atlas", `${type}.png`);
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

        if (!x || !y) {
          throw new Error("Invalid enemy object");
        }

        if (!type) {
          throw new Error("Enemy object missing type!");
        }

        if (type === "muddy") {
          this.enemies.add(new Muddy(this, x, y));
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
      spikes.objects.forEach((spike) => {
        const { x, y, width, height, type } = spike;

        if (!x || !y || !width || !height) {
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

        if (!x || !y || !width || !height) {
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

        if (!x || !y || !width || !height) {
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

  setupPlayer() {
    // todo later
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
