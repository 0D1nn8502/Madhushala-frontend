// import Phaser from 'phaser'; 

import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from './gameConfig'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

interface Element {
  _id: string; 
  name: string; 
  imageUrl: string; 
  scale?: number 
} 

interface SpaceState {
  apiUrl: string; 
  elements: Array<Element>; 
}


const Space: React.FC = () => {

    const location = useLocation();  
    const navigate = useNavigate(); 
    const raw = location.state as SpaceState | undefined;   
    
    const apiUrl = raw?.apiUrl; 
    const initialElements = raw?.elements ?? null; 

    useEffect(() => {
      if (!apiUrl) {
        console.error('Missing apiUrl in router state');
        navigate('/profile');
      }
    }, [apiUrl, navigate]); 

    const [elements, setElements] = useState <Element[] | null> (initialElements);   

    const [isFetching, setFetching] = useState <boolean> (initialElements == null);  

    // 1) Fetch palette if missing
    useEffect(() => {
      if (!apiUrl) return; 
      if (elements) {
        setFetching(false);
        return;
      }

    setFetching(true);
    const token = localStorage.getItem('token');
    axios.get<Element[]>(`${apiUrl}/space/elements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(resp => {
      setElements(resp.data);
    })
    .catch(err => {
      console.error('Error fetching elements:', err);
      navigate('/profile');
    })
    .finally(() => {
      setFetching(false);
    });
  }, [apiUrl, elements, navigate]);
    
    useEffect(() => { 
      if (isFetching || !elements) return; 

      const game = new Phaser.Game(gameConfig); 
      game.scene.start('SpaceScene', {
        apiUrl,  
        elements 
      }); 

      return () => {
        game.destroy(true); 
      };

    }, [apiUrl, isFetching, elements]);  
  
    return (
      <div id="game-container" style={{ width: '800px', height: '600px' }}></div>
    );

};

  
export default Space;

