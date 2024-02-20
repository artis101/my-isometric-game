import React, { StyleHTMLAttributes } from "react";

type GameOverScreenProps = {
  onRetry: () => void;
};

const GameOverScreen = ({ onRetry }: GameOverScreenProps) => (
  <div style={styles.overlay}>
    <div style={styles.container}>
      <div style={styles.gameOverText}>GAME OVER</div>
      <button style={styles.retryButton} onClick={onRetry}>
        RETRY?
      </button>
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
  },
  container: {
    textAlign: "center",
    padding: 20,
  },
  gameOverText: {
    fontSize: "48px",
    fontFamily: "Arial, sans-serif", // Using a system font
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase", // Makes the text blocky
  },
  retryButton: {
    marginTop: "20px",
    fontSize: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "orange",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    textTransform: "uppercase",
  },
};

export default GameOverScreen;
