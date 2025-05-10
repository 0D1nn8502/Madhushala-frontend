import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import joinedGameConfig from './JoinedGameConfig';  
import { SpaceElement } from './JoinedSpace'; 

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

interface Element {
  _id: string; 
  name: string; 
  imageUrl: string; 
  scale?: number 
} 

interface JoinedState {
  spaceData: { spaceElements: SpaceElement[] };
  elements: Array<Element>; 
}

export const JoinedSpace: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate     = useNavigate();
  const location     = useLocation() as { state: JoinedState };
  const user         = JSON.parse(localStorage.getItem('user') || '{}');

  const [spaceData, setSpaceData]   = useState<JoinedState['spaceData'] | null>(
    location.state?.spaceData ?? null
  );
  const [elements, setElements]  = useState<JoinedState['elements'] | null>(
    location.state?.elements ?? null
  );
  const [isFetching, setIsFetching] = useState<boolean>(!location.state);

  // If we have no state, fetch both endpoints
  useEffect(() => {
    if (!spaceId) {
      navigate('/profile');
      return;
    }
    if (!user._id) {
      navigate('/profile');
      return;
    }
    if (spaceData && elements) {
      // already have everything → skip fetching
      setIsFetching(false);
      return;
    }

    // fetch missing data
    const token = localStorage.getItem('token');
    setIsFetching(true);

    Promise.all([
      axios.get(`${API_URL}/space/join/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/space/elements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([spaceRes, elemRes]) => {
        setSpaceData(spaceRes.data);
        setElements(elemRes.data);
      })
      .catch(err => {
        console.error('Error fetching join data', err);
        navigate(`/profile/${user._id}`);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [spaceId, user._id, spaceData, elements, navigate]);


  // Once we have both spaceData & elements, launch Phaser: 
  useEffect(() => {
    if (isFetching) return;
    if (!spaceData || !elements) return;

    const game = new Phaser.Game(joinedGameConfig);
    game.scene.start('JoinedScene', {
      userId:    user._id,
      spaceId,
      apiUrl:    API_URL,
      spaceData,
      elements
    });

    return () => {
      game.destroy(true);
    };
  }, [isFetching, spaceData, elements, user._id, spaceId]);

  if (isFetching || !spaceData || !elements) {
    return <div>Loading space…</div>;
  }

  return <div id="game-container" style={{ width: 800, height: 600 }} />;
};

export default JoinedSpace;
