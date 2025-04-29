import Phaser from 'phaser'; 
import { JoinedScene } from './JoinedSpace';

const joinedGameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, 
    width: 1500, 
    height: 1500, 
    scene: [JoinedScene], 
    parent: 'game-container', 
};

export default joinedGameConfig;
