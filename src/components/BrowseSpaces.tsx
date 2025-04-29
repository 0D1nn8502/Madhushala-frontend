import { useState, useEffect } from "react";
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";
import { useSpace } from "../context/SpaceContext";
import "./styles/BrowseSpaces.css"; 

interface SpaceDisplay {
    _id: string;
    name: string;
    owner: string; // username of owner
}

export const BrowseSpaces : React.FC = () => {

    const [spaces, setSpaces] = useState <SpaceDisplay[]> ([]); 
    const [loading, setLoading] = useState <boolean>(true); 
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setSpaceData } = useSpace();


    useEffect(() => {
        fetchOnlineSpaces();
    }, []);


    const fetchOnlineSpaces = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/space/online`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setSpaces(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching online spaces:", error);
            setError("Failed to load online spaces. Please try again later.");
            setLoading(false);
        }
    };

    const joinSpace = async (spaceId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/space/join/${spaceId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setSpaceData(response.data);
            navigate(`/join/${spaceId}`);
        } catch (error) {
            console.error("Error joining space:", error);
            setError("Failed to join space. Please try again later.");
        }
    };

    if (loading) {
        return <div className="browse-spaces-container">Loading online spaces...</div>;
    }

    if (error) {
        return <div className="browse-spaces-container error">{error}</div>;
    }

    return (
        <div className="browse-spaces-container">
            <h1 className="browse-title">Online Spaces</h1>
            <p className="browse-subtitle">Join other creators in their spaces</p>
            
            {spaces.length === 0 ? (
                <div className="no-spaces">
                    <p>No online spaces available at the moment.</p>
                    <p>Check back later or create your own space!</p>
                </div>
            ) : (
                <div className="spaces-grid">
                    {spaces.map((space) => (
                        <div key={space._id} className="space-card">
                            <div className="space-info">
                                <h2 className="space-name">{space.name}</h2>
                                <p className="space-owner">Created by: {space.owner}</p>
                            </div>
                            <button 
                                className="join-button"
                                onClick={() => joinSpace(space._id)}
                            >
                                Join Space
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button 
                className="back-button"
                onClick={() => navigate('/profile')}
            >
                Back 
            </button>
        </div>
    )
}