import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GAME_WIDTH = 16 * 24;
const GAME_HEIGHT = 16 * 18;
const PLAYER_VELOCITY_X = 160;
const PLAYER_VELOCITY_Y = -250;
const PLAYER_MASS = 1;
const PLAYER_BOUNCE = 0.2;

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let cameraDolly: Phaser.Geom.Point;
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    const gemSprites: Phaser.GameObjects.Sprite[] = [];

    function preload(this: Phaser.Scene) {
      this.load.multiatlas("atlas", "sprites/atlas.json", "sprites/");
      this.load.image("background", "assets/back.png");
      this.load.image("middleground", "assets/middle.png");
      this.load.tilemapTiledJSON("map", "maps/level1.json");
    }

    function create(this: Phaser.Scene) {
      if (this.input && this.input.keyboard) {
        cursors = this.input.keyboard.createCursorKeys();
      }

      const map = this.add.tilemap("map");

      const background = this.add.tileSprite(0, 0, map.width, 0, "background").setOrigin(0, 0);
      const middleground = this.add.tileSprite(0, 80, GAME_WIDTH, GAME_HEIGHT, "middleground").setOrigin(0, 0);
      // background and middleground are fixed to the camera
      background.setScrollFactor(0);
      middleground.setScrollFactor(0);

      if (!map) {
        throw new Error("Failed to load map");
      }

      const tileset = map.addTilesetImage("atlas", "atlas", 16, 16);

      if (!tileset) {
        throw new Error("Failed to load tileset");
      }

      map.createLayer("Background", tileset, 0, 0);
      const ground = map.createLayer("Ground", tileset, 0, 0);

      if (!ground) {
        throw new Error("Failed to create ground layer");
      }

      ground.setCollisionByProperty({ collides: true });

      const topCollisionTitles = map.filterTiles((tile: any) => tile && tile.properties && tile.properties.collidesTop);

      if (topCollisionTitles) {
        topCollisionTitles.forEach((tile) => {
          tile.setCollision(false, false, true, false);
        });
      }

      // create player from tileset sprite
      player = this.physics.add.sprite(152, 448, "atlas", "idle/player-idle-1.png");
      player.setBounce(PLAYER_BOUNCE);
      player.setMass(PLAYER_MASS);
      player.setCollideWorldBounds(true);
      player.body.setSize(16, 32);

      // add object layer spikes
      const spikes = map.getObjectLayer("Spikes");

      if (spikes) {
        const spikeSprites: Phaser.GameObjects.Sprite[] = [];

        spikes.objects.forEach((spike) => {
          const { x, y, width, height } = spike;

          if (!x || !y || !width || !height) {
            throw new Error("Invalid spike object");
          }

          const spikeSprite = this.add.sprite(x + width / 2, y - height, "atlas", "spikes.png");

          const gameSprite = this.physics.add.existing(spikeSprite, true);
          spikeSprites.push(gameSprite);
        });

        this.physics.add.collider(player, spikeSprites, () => {
          player.setVelocity(0, 0);
        });
      }

      // add object layer gems
      const gems = map.getObjectLayer("Gems");

      if (gems) {
        gems.objects.forEach((gem) => {
          const { x, y, width, height } = gem;

          if (!x || !y || !width || !height) {
            throw new Error("Invalid gem object");
          }

          const gemSprite = this.add.sprite(x + width / 2, y - height, "atlas", "gem-1.png");
          gemSprites.push(gemSprite);

          this.physics.add.existing(gemSprite, true);
        });

        this.physics.add.overlap(player, gemSprites, (_, gem) => {
          gem.destroy();
          gemSprites.splice(gemSprites.indexOf(gem as unknown as Phaser.GameObjects.Sprite), 1);
        });
      }

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
        key: "enemy-death",
        frames: this.anims.generateFrameNames("atlas", {
          prefix: "enemy-death-",
          suffix: ".png",
          start: 1,
          end: 6,
        }),
        frameRate: 5,
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
        frameRate: 5,
        repeat: -1,
      });

      this.physics.add.collider(player, ground);
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.cameras.main.setBounds(0, 0, ground.width, ground.height);

      cameraDolly = new Phaser.Geom.Point(player.x, player.y);
      this.cameras.main.startFollow(cameraDolly);
    }

    function update(this: Phaser.Scene) {
      if (cursors.left.isDown) {
        player.setVelocityX(-PLAYER_VELOCITY_X);

        if (player.body.onFloor()) {
          player.anims.play("run", true);
        }
      } else if (cursors.right.isDown) {
        player.setVelocityX(PLAYER_VELOCITY_X);

        if (player.body.onFloor()) {
          player.anims.play("run", true);
        }
      } else {
        player.setVelocityX(0);

        if (player.body.onFloor()) {
          player.anims.play("idle", true);
        }
      }

      if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()) {
        player.setVelocityY(PLAYER_VELOCITY_Y);
        player.anims.play("jump", true);
      }

      if (player.body.velocity.x > 0) {
        player.setFlipX(false);
      } else if (player.body.velocity.x < 0) {
        player.setFlipX(true);
      }

      gemSprites.forEach((gem) => {
        gem.anims.play("gem", true);
      });

      cameraDolly.x = Math.floor(player.x);
      cameraDolly.y = Math.floor(player.y);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 },
          debug: true,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
      scale: {
        mode: Phaser.Scale.NONE, // Phaser will not scale the game
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        zoom: window.devicePixelRatio,
      },
    };

    const game = new Phaser.Game(config);

    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container"></div>;
};

export default App;
