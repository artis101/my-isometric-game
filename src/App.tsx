import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GAME_WIDTH = 16 * 24;
const GAME_HEIGHT = 16 * 18;
const GRAVITY = 300;
const PLAYER_VELOCITY_X = 160;
const PLAYER_VELOCITY_Y = -350;
const PLAYER_BOUNCE = 0.2;

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let cameraDolly: Phaser.Geom.Point;
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    function preload(this: Phaser.Scene) {
      this.load.image("background", "assets/back.png");
      this.load.image("middleground", "assets/middle.png");
      this.load.multiatlas("atlas", "sprites/atlas.json", "sprites/");
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

      const tileset = map.addTilesetImage("props", "atlas", 16, 16);

      if (!tileset) {
        throw new Error("Failed to load tileset");
      }

      map.createLayer("Background", tileset, 0, 0);

      const ground = map.createLayer("Ground", tileset, 0, 0);
      ground?.setCollisionByProperty({ collides: true });

      if (!ground) {
        throw new Error("Failed to create ground layer");
      }

      // add object layer spikes
      const spikes = map.getObjectLayer("Spikes");

      if (spikes) {
        spikes.objects.forEach((spike) => {
          const { x, y, width, height } = spike;

          if (!x || !y || !width || !height) {
            throw new Error("Invalid spike object");
          }

          const spikeSprite = this.add.sprite(x - width, y - height, "atlas", "spikes.png");
        });
      }

      // create player from tileset sprite
      player = this.physics.add.sprite(160, 32, "atlas", "idle/player-idle-1.png");
      player.setBounce(PLAYER_BOUNCE);
      player.body.setSize(16, 32);
      player.body.setGravityY(GRAVITY);

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
        frameRate: 10,
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
          debug: false,
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
