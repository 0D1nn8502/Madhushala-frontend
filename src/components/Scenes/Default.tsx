// import Phaser from 'phaser'; 

import { useEffect } from 'react';
import Phaser from 'phaser';
import gameConfig from './gameConfig';

const Space: React.FC = () => {
    useEffect(() => { 
      let game: Phaser.Game | null = null; 

      const spaceData = JSON.parse(localStorage.getItem('spaceData') || '{}');
      if (spaceData) {
        game = new Phaser.Game(gameConfig); 
        game.scene.start('SpaceScene', { 
          spaceData, 
          apiUrl: import.meta.env.VITE_REACT_APP_API_URL
        });
      }

      return () => {
        if (game) {
          game.destroy(true); // <-- This fully removes Phaser instance!
        }
      };

    }, []); 
  
    return (
      <div id="game-container" style={{ width: '800px', height: '600px' }}></div>
    );

};

  
export default Space;


