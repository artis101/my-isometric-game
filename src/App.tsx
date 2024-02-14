import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GAME_WIDTH = 384;
const GAME_HEIGHT = 240;
const GRAVITY = 800;
const PLAYER_VELOCITY_X = 160;
const PLAYER_VELOCITY_Y = -330;
const PLAYER_BOUNCE = 0.2;
const PLAYER_ANIM_FRAME_RATE = 16;

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let game: Phaser.Game;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let background: Phaser.GameObjects.TileSprite;
    let middleground: Phaser.GameObjects.TileSprite;

    function preload(this: Phaser.Scene) {
      this.load.image("background", "assets/environment/back.png");
      this.load.image("middleground", "assets/environment/middle.png");

      this.load.atlas("atlas", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
      this.load.atlas("atlas-props", "assets/atlas/atlas-props.png", "assets/atlas/atlas-props.json");
      this.load.image("tileset", "assets/environment/tileset.png");
      this.load.tilemapTiledJSON("map", "assets/maps/map.json");
    }

    function create(this: Phaser.Scene) {
      if (this.input && this.input.keyboard) {
        cursors = this.input.keyboard.createCursorKeys();
      }

      const map = this.add.tilemap("map");
      const tileset = map.addTilesetImage("tileset", "tileset", 16, 16);

      if (!map || !tileset) {
        return;
      }

      background = this.add.tileSprite(0, 0, map.width, 0, "background").setOrigin(0, 0);
      middleground = this.add.tileSprite(0, 80, GAME_WIDTH, GAME_HEIGHT, "middleground").setOrigin(0, 0);
      // background and middleground are fixed to the camera
      background.setScrollFactor(0);
      middleground.setScrollFactor(0);

      const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);

      if (!layer) {
        return;
      }

      map.setCollision([
        27, 29, 31, 33, 35, 37, 77, 81, 86, 87, 127, 129, 131, 133, 134, 135, 83, 84, 502, 504, 505, 529, 530, 333, 335,
        337, 339, 366, 368, 262, 191, 193, 195, 241, 245, 291, 293, 295,
      ]);

      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.textures.get("atlas");
      // const frames = atlasTexture.getFrameNames();
      // console.log({ frames });

      player = this.physics.add.sprite(40, 9, "atlas", "player/idle/player-idle-1");
      player.setBounce(PLAYER_BOUNCE);
      player.setCollideWorldBounds(true);
      player.body.setSize(16, 32);
      player.body.setGravityY(GRAVITY);

      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNames("atlas", { prefix: "player/idle/player-idle-", start: 1, end: 2 }),
        frameRate: PLAYER_ANIM_FRAME_RATE,
      });
      this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNames("atlas", { prefix: "player/run/player-run-", start: 1, end: 6 }),
        frameRate: PLAYER_ANIM_FRAME_RATE,
        repeat: -1,
      });
      this.anims.create({
        key: "jump",
        frames: this.anims.generateFrameNames("atlas", { prefix: "player/jump/player-jump-", start: 1, end: 2 }),
        frameRate: PLAYER_ANIM_FRAME_RATE,
      });

      this.physics.add.collider(player, layer);
      this.cameras.main.startFollow(player);
    }

    function update(this: Phaser.Scene) {
      if (cursors.left.isDown) {
        player.setFlipX(true);
        player.setVelocityX(-PLAYER_VELOCITY_X);

        player.anims.play("run", true);
      } else if (cursors.right.isDown) {
        player.setFlipX(false);
        player.setVelocityX(PLAYER_VELOCITY_X);

        player.anims.play("run", true);
      } else {
        player.setVelocityX(0);

        player.anims.play("idle");
      }

      if (cursors.up.isDown && player.body.onFloor()) {
        player.anims.play("jump", true);
        player.setVelocityY(PLAYER_VELOCITY_Y);
      }

      // parallax scrolling for background and middleground
      background.tilePositionX = this.cameras.main.scrollX * 0.1;
      middleground.tilePositionX = this.cameras.main.scrollX * 0.5;
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
        mode: Phaser.Scale.ZOOM_2X,
        autoCenter: Phaser.Scale.RESIZE,
      },
    };

    game = new Phaser.Game(config);

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
