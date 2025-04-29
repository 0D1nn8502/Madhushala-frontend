
import Phaser from 'phaser'; 
import {SpaceScene} from './SpaceScene'; 


const gameConfig : Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, 
    width: 1500, 
    height: 1500, 
    scene: [SpaceScene], 
    parent: 'game-container', 
} 


export default gameConfig; 
