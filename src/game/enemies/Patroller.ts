import { BaseScene } from "../scenes/BaseScene";

export abstract class Pattroller extends Phaser.Physics.Arcade.Sprite {
  public scene!: BaseScene;

  /**
   * This Game Object's Physics Body.
   */
  body!: Phaser.Physics.Arcade.Body;

  private noMovement = true;

  update() {
    // walk back and forth on the platform
    if (this.body.onFloor()) {
      // get the dimensions of the platform we are walking on
      const tileBelow = this.scene.ground.getTileAtWorldXY(this.x, this.y + 16);

      if (!tileBelow) {
        return;
      }

      const tileBelowToTheRight = this.scene.ground.getTileAtWorldXY(this.x + 16, this.y + 16);
      const tileBelowToTheLeft = this.scene.ground.getTileAtWorldXY(this.x - 16, this.y + 16);

      // initial start
      if (this.noMovement && (tileBelowToTheRight || tileBelowToTheLeft)) {
        this.noMovement = false;
        if (tileBelowToTheRight) {
          this.setVelocityX(100);
        } else {
          this.setVelocityX(-100);
        }
      }
      // if we are at the edge of the platform, turn around
      if (tileBelowToTheLeft && !tileBelowToTheRight) {
        this.setFlipX(false);
        this.setVelocityX(-100);
      } else if (tileBelowToTheRight && !tileBelowToTheLeft) {
        this.setFlipX(true);
        this.setVelocityX(100);
      } else if (!tileBelowToTheLeft && !tileBelowToTheRight) {
        this.setVelocityX(0);
      }
    }
  }
}
