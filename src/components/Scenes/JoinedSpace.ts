import Phaser from 'phaser';
import { AvatarClient } from './ClientSide/AvatarClient';

export interface SpaceElement {
  elementId: string;
  x: number;
  y: number;
  link?: string; 
}

type Direction = 'up' | 'down' | 'left' | 'right';  

export class JoinedScene extends Phaser.Scene {
  private selfAvatar!: AvatarClient;
  private others = new Map<string, AvatarClient>();
  private socket! : WebSocket;

  private userId!: string;
  private spaceId!: string;
  private apiUrl!: string;
  private spaceData!: { spaceElements: SpaceElement[] };
  private elements: Array<{ _id: string; name: string; imageUrl: string; scale?: number }> = [];

  // Links functionality //  
  private signboards: Phaser.GameObjects.Image[] = []; 
  private visitText!: Phaser.GameObjects.Text;
  private currentSignboardLink: string | null = null; 

  constructor() {
    super({ key: 'JoinedScene' });
  }

  init(data: any) {
    // Validate required data
    if (!data.userId) {
      console.error('userId is required but was not provided');
      this.scene.stop();
      window.location.href = '/profile';
      return;
    }

    if (!data.spaceId) {
      console.error('spaceId is required but was not provided');
      this.scene.stop();
      window.location.href = '/profile';
      return;
    }

    if (!data.apiUrl) {
      console.error('apiUrl is required but was not provided');
      this.scene.stop();
      window.location.href = '/profile';
      return;
    }

    if (!data.spaceData) {
      console.error('Space data not here'); 
      this.scene.stop(); 
      window.location.href = '/profile'; 
      return; 
    }

    this.userId = data.userId;
    this.spaceId = data.spaceId;
    this.apiUrl = data.apiUrl;
    this.spaceData = data.spaceData;
    this.elements = data.elements; 

    console.log('Initializing JoinedScene with:', {
      userId: this.userId,
      spaceId: this.spaceId,
      apiUrl: this.apiUrl
    });
  }

  preload() {
    // 1) Load your avatar spritesheet & tile
    this.load.spritesheet('avatar', 'https://madhushala-bucket.s3.ap-south-1.amazonaws.com/avatars/dude.png', {
      frameWidth: 64,
      frameHeight: 64
    });  
    this.load.image('grass', 'https://madhushala-bucket.s3.ap-south-1.amazonaws.com/tiles/Grass1.png'); 

    // 4) Load each element's image
    for (const e of this.elements) {
      this.load.image(e.name, e.imageUrl);
    }
  }

  create() {
    // draw background
    this.add.tileSprite(0, 0, 1500, 1500, 'grass').setOrigin(0);

    // place static props
    for (const el of this.spaceData.spaceElements) {
      const meta = this.elements.find(m => m._id === el.elementId);
      if (!meta) continue;
      const img = this.add.image(el.x, el.y, meta.name);
      if (meta.scale) img.setScale(meta.scale);
      img.setInteractive();

      // Stash signboard for tracking // 
      if (meta.name === 'Signboard') {
        const placement = this.spaceData.spaceElements.find(se => se.elementId === el.elementId && se.x === el.x && se.y === el.y);
        const link = (placement as any).link; 
        console.log("Link placed : ", link); 
        img.setData('link', link);

        this.signboards.push(img); 
      }
    }

     // Create a hidden HUD prompt in screen-space: 
     this.visitText = this.add
     .text(400, 550, '🔗 Visit', { fontSize: '24px', backgroundColor: '#000'})
     .setScrollFactor(0)
     .setVisible(false)
     .setInteractive()
     .on('pointerdown', () => {
       if (this.currentSignboardLink) {
         window.open(this.currentSignboardLink, '_blank');
       }
     });

    // set up animations
    this.createAnimations();

    // open WebSocket // 
    const wsUrl = this.apiUrl
      .replace(/^http/, 'ws')
      .replace(/^https/, 'wss')  // Handle HTTPS in production? 
      + `/space-ws/${this.spaceId}?userId=${this.userId}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    this.socket = new WebSocket(wsUrl);
    
    // Add error handling // 
    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Add reconnection logic (should not run when user chose to disconnect) // 
    this.socket.addEventListener('close', () => { 

      this.selfAvatar.destroy(); // ?? // 
      console.log('WebSocket closed, attempting to reconnect...'); 
      setTimeout(() => {
        if (this.socket.readyState === WebSocket.CLOSED) {
          this.socket = new WebSocket(wsUrl);
          this.setupWebSocketListeners();
        }
      }, 3000);
    });

    this.setupWebSocketListeners();

    // spawn your own avatar at 0,0
    this.selfAvatar = new AvatarClient({
      scene:    this,
      userId:   this.userId,
      ws:       this.socket,
      startX:   0,
      startY:   0,
      spriteKey:'avatar'
    });
    
    // Make the avatar bigger
    if (this.selfAvatar.sprite) {
        this.selfAvatar.sprite.setScale(1.2);
    }

    // back button
    this.add
      .text(20, 20, '← Back', { fontSize: '24px', color: '#fff' })
      .setInteractive()
      .on('pointerdown', () => {
        this.shutdown(); 
        window.location.href = `/profile`;   
      }
    );
  }

  private setupWebSocketListeners() {
    // handle incoming messages
    this.socket.addEventListener('message', e => {
      const msg = JSON.parse(e.data);
      console.log('Received WebSocket message:', msg);
      
      switch (msg.type) {
        case 'snapshot':
          console.log('Received snapshot with players:', msg.players);
          // spawn & position everyone in one pass
          msg.players.forEach((p: any) => {
            this.spawnOther(p.userId, p.x, p.y); 
            // this.moveOther(p.userId, p.x, p.y, p.dir); 
          });
          break;

        case 'join':
          console.log('User joined:', msg.userId);
          this.spawnOther(msg.userId);
          break; 

        case 'move':
          console.log('User moved:', msg.userId, 'to', msg.x, msg.y, 'dir', msg.dir);
          this.moveOther(msg.userId, msg.x, msg.y, msg.dir);            
          break;

        case 'leave':
          console.log('User left:', msg.userId);
          this.despawnOther(msg.userId);
          break;
      }
    });

    // announce yourself when ready
    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected, announcing presence...');
      this.socket.send(JSON.stringify({ type: 'join', userId: this.userId }));
    });
  }

  update() {
    // only drive your avatar if it exists
    if (!this.selfAvatar) {
      return; 
    }

    this.selfAvatar.update(); 

    // Check proximity to a signboard // 
    const px = this.selfAvatar.sprite.x;
    const py = this.selfAvatar.sprite.y;
    let foundLink: string | null = null;

    for (const sb of this.signboards) {
      const dist = Phaser.Math.Distance.Between(px, py, sb.x, sb.y);
      if (dist < 50) {     // within 50px
        foundLink = sb.getData('link');
        console.log("Seen a link! : ", foundLink);
        break;
      }
    }

    if (foundLink) {
      this.currentSignboardLink = foundLink;
      this.visitText.setVisible(true);
    } else {
      this.currentSignboardLink = null;
      this.visitText.setVisible(false);
    }

  }

  private spawnOther(userId: string, x=0, y=0) { 
    if (this.others.has(userId)) return;
    const avatar = new AvatarClient({
      scene:    this,
      userId,
      ws:       this.socket,
      startX:   x,
      startY:   y, 
      spriteKey:'avatar'
    });
    
    if (!avatar.sprite) {
      console.error('Sprite not spawned for user : ', this.userId); 
    }

    avatar.sprite.setScale(1.2);  
    
    this.others.set(userId, avatar);
  }

  private moveOther(userId: string, x: number, y: number, dir: Direction) { 
    const avatar = this.others.get(userId); 

    if (!avatar) {return;} 

    avatar.sprite.play(dir, true); 

    this.tweens.add({
          targets: avatar.sprite,
          x,
          y, 
          ease: 'Linear', 
          duration: 100,
          onComplete: () => {
            avatar.sprite.play('idle', true);
          }
    });

  }

  private despawnOther(userId: string) {
    const avatar = this.others.get(userId);
    if (!avatar) return;
    avatar.destroy();
    this.others.delete(userId);
  }

  private shutdown() {
    this.selfAvatar.destroy();
    this.despawnOther(this.userId); 
    this.others.forEach(a => a.destroy());
    this.events.removeAllListeners();
    this.socket.close();
    this.scene.stop(); 
  }

  private createAnimations() {
    this.anims.create({ key: 'left',  frames: this.anims.generateFrameNumbers('avatar',{start:118,end:125}), frameRate:10, repeat:-1 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('avatar',{start:144,end:151}), frameRate:10, repeat:-1 });
    this.anims.create({ key: 'up',    frames: this.anims.generateFrameNumbers('avatar',{start:105,end:112}), frameRate:10, repeat:-1 });
    this.anims.create({ key: 'down',  frames: this.anims.generateFrameNumbers('avatar',{start:131,end:138}), frameRate:10, repeat:-1 });
    this.anims.create({ key: 'idle',  frames:[{key:'avatar',frame:0}],                             frameRate:10, repeat:-1 });
  }
}
