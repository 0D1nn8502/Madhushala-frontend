// Spaces within spaces : A house interior within a space with some props in it : levels of space data? // 

import { useEffect } from 'react';
import Phaser from 'phaser';
import joinedGameConfig from './JoinedGameConfig';
import { useSpace } from '../../context/SpaceContext';
import { useNavigate, useParams } from 'react-router-dom';

const JoinedSpace: React.FC = () => {

    const {spaceData} = useSpace(); 
    const navigate = useNavigate();
    const { spaceId } = useParams<{ spaceId: string }>();
    
    useEffect(() => {
      if (!spaceId) {
        console.error("No space ID provided");
        navigate('/profile');
        return;
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData._id) {
        console.error("No user ID found");
        navigate('/profile');
        return;
      }
      
      const game = new Phaser.Game(joinedGameConfig); 
      console.log("Starting JoinedScene with user:", userData._id);
      game.scene.start('JoinedScene', { 
        spaceId,
        spaceData,
        userId: userData._id,
        apiUrl: import.meta.env.VITE_REACT_APP_API_URL,
        navigate
      });
    
      // Cleanup function to destroy the game when component unmounts
      return () => {
        game.destroy(true);
      };
    }, [spaceData, navigate, spaceId]);  
  
    return (
      <div id="game-container" style={{ width: '800px', height: '600px' }}></div>
    );

};
 
  
export default JoinedSpace;


