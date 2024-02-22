import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import GameOverScreen from "./GameOverScreen";
import { GAME_HEIGHT, GAME_WIDTH, GameState } from "./constants";
import { Level1 } from "./game/scenes/Level1";
import { Preload } from "./game/scenes/Preload";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.RUNNING);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
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
      scene: [Preload, Level1],
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

  return (
    <div id="root">
      {gameState === GameState.PLAYER_DEAD && (
        <GameOverScreen
          onRetry={() => {
            if (gameRef.current) {
              gameRef.current.resume();
              // start level1
              gameRef.current.scene.start("level1");
            }
            setGameState(GameState.RUNNING);
          }}
        />
      )}
      <div id="game-container"></div>
    </div>
  );
};

export default App;
