// client/AvatarClient.ts
import Phaser from 'phaser';

export interface AvatarOptions {
  scene: Phaser.Scene;
  userId: string;
  ws: WebSocket;
  startX: number;
  startY: number;
  spriteKey: string;
}


export class AvatarClient {
  public sprite: Phaser.GameObjects.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private ws: WebSocket;
  private userId: string;

  constructor(opts: AvatarOptions) {
    this.ws     = opts.ws;
    this.userId = opts.userId;

    // 1️⃣ Create your sprite
    this.sprite = opts.scene.add
      .sprite(opts.startX, opts.startY, opts.spriteKey)
      .setScale(0.5);

    // 2️⃣ Hook input
    this.cursors = opts.scene.input.keyboard!.createCursorKeys();
  }

  update() {
    let moved = false;
    const speed = 200;
    const dt    = this.sprite.scene.game.loop.delta / 1000;

    if (this.cursors.left?.isDown) {
      this.sprite.x -= speed * dt; moved = true;
      this.sprite.play('left',  true);
    } else if (this.cursors.right?.isDown) {
      this.sprite.x += speed * dt; moved = true;
      this.sprite.play('right', true);
    } else if (this.cursors.up?.isDown) {
      this.sprite.y -= speed * dt; moved = true;
      this.sprite.play('up',    true);
    } else if (this.cursors.down?.isDown) {
      this.sprite.y += speed * dt; moved = true;
      this.sprite.play('down',  true);
    } else {
      this.sprite.play('idle',  true);
    }

    // 3️⃣ Send move only if socket is OPEN and we actually moved
    if (
      moved &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.send(
        JSON.stringify({
          type:   'move',         // matches server's WSMsg
          userId: this.userId,
          x:      this.sprite.x,
          y:      this.sprite.y
        })
      );
    }
  }

  
  destroy() {
    // Only destroy sprite; do NOT close the shared WebSocket here
    this.sprite.destroy();
  }
}
