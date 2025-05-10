import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { Link } from 'react-router-dom';
import './styles/Profile.css'; 
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';


interface UserProfile {
  _id: string; 
  username: string; 
  image: string; 
  avatar?: string; 
  description: string; 
  spaces?: Array<{spaceId: string; spaceName: string}>;  
}

const API_URL = import.meta.env.VITE_REACT_APP_API_URL; 


export const Profile: React.FC = () => {
  const { userId: paramId } = useParams<{userId?: string}>();   
  
  // Pull own ID // 
  const stored = localStorage.getItem('user'); 
  const meId = stored? (JSON.parse(stored) as UserProfile)._id : undefined; 

  const userId = paramId ?? meId; // If no paramId, then own id // 
  
  const navigate = useNavigate();  
  const [user, setUser] = useState <UserProfile | null> (null); 
  const [spaces, setSpaces] = useState <UserProfile['spaces']> ([]);  


  useEffect(() => {
    if (!userId) {
      navigate('/'); 
    }
  }, [userId, navigate]);

  
  useEffect(() => {
    if (!userId) return;
    
    const endpoint = `${API_URL}/user/profile/${userId}`; 

    const fetchUserProfile = async() => {
      const token = localStorage.getItem('token'); 
  
      try {
        const response = await axios.get(endpoint, {
          headers: {
            "Authorization": `Bearer ${token}` 
          }
        }); 
  
        const data = response.data as UserProfile; 
        setUser(data); 
        setSpaces(data.spaces || []);  
  
      } catch (error) {
        console.error("Error fetching user profile", error); 
  
        // If unauthorized Or not found // 
        if (paramId) { 
          navigate('/');  
        }
      }
    }

    fetchUserProfile(); 
    
  }, [userId]);   

  if (!user) {
    return <div> Loading profile ...  </div>
  }

  // function changeProfilePic() {
  //   console.log("Want to change Pic");
  // }

  async function createSpace () {

    try { 
      const token = localStorage.getItem('token');

      // Fetch the element definitions you need in SpaceScene // 
      const { data: elements } = await axios.get<
        Array<{ _id: string; name: string; imageUrl: string; scale?: number }>
      >(`${API_URL}/space/elements`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log( "API URL : ", API_URL); 
  
      // Navigate into /space with `elements` in state // 
      navigate('/space', {
        state: {
          apiUrl: API_URL, 
          elements
        }
      }); 
      
    } catch (error) {
      console.error("Error creating space: ", error) 
    }

  }

  // async function changeDescription () {
    
  // }


  async function joinSpace(spaceId:string) {
    
    try {
      const token = localStorage.getItem('token'); 
      
      const res = await axios.get(
        `${API_URL}/space/join/${spaceId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          } 
        }
      )

      const spaceData = res.data; 
      
      const elemres = await axios.get(`${API_URL}/space/elements`, {
        headers: {Authorization: `Bearer ${token}`} 
      }); 
      const elements = elemres.data as Array<{
        _id: string; 
        name: string; 
        imageUrl: string; 
        scale?: number; 
      }>; 

      // Navigate with space and element data (can be made better) // 
      navigate(`/join/${spaceId}`, {
        state: {
          spaceData: spaceData, 
          elements: elements 
        }
      })

    } catch (error) {
      console.error("Spacedata not found"); 
      navigate('/profile'); 
    }
    
  }

  // async function editSpace(spaceId:string) { 
  //   try {
  //     const token = localStorage.getItem('token'); 
      
  //     const res = await axios.get(
  //       `${API_URL}/space/join/${spaceId}`, 
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, 
  //         } 
  //       }
  //     )

  //     const spaceData = res.data; 
      
  //     const elemres = await axios.get(`${API_URL}/space/elements`, {
  //       headers: {Authorization: `Bearer ${token}`} 
  //     }); 
  //     const elements = elemres.data as Array<{
  //       _id: string; 
  //       name: string; 
  //       imageUrl: string; 
  //       scale?: number;
  //     }>; 

  //     // Navigate with space and element data (can be made better) // 
  //     navigate(`/edit/${spaceId}`, {
  //       state: {
  //         spaceData: spaceData, 
  //         elements: elements 
  //       }
  //     })

  //   } catch (error) {
  //     console.error("Spacedata not found"); 
  //     navigate('/profile'); 
  //   }
  // }


  async function deleteSpace(spaceId:string, spaceName:string) {
    if (!window.confirm(`Delete space "${spaceName}" permanently?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/space/${spaceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from local state // 
      setSpaces(spaces!.filter(s => s.spaceId !== spaceId));

    } catch (err) {
      console.error('Error deleting space:', err);
      alert('Failed to delete space. Please try again.');
    }
  }

  
  return (
    <div className="profile-container">
      <h2>{user.username}</h2>
      <div className="image-container">
        <img src={user.image} alt="Profile" />
      </div>

      {/* Only show edit controls when viewing your own profile */} 

      

      {!paramId && (
        <>
          <button onClick={() => console.log('Change Picture')}>Change Picture</button> 

          <div className='descriptionContainer'>

          <p>Description: {user.description || 'Enter a short description'}</p>
          <button onClick={() => console.log('Change Description')}>Change Description</button> <br></br> 

          </div> 
          <button
            onClick={createSpace} 
            disabled={!!user.spaces && user.spaces.length > 0}
          >
            Create Space
          </button>
        </>
      )}

      <div className='spaceContainer'>
      <h2>{paramId ? `${user.username}'s Spaces` : 'Your Spaces'}</h2>
      {spaces && spaces.length > 0 ? (
        <ul>
          {spaces.map((space, idx) => (
            <li key={idx}>

              <button
                onClick={() => joinSpace(space.spaceId) } 
              >
                {space.spaceName}
              </button>

            {!paramId && (
            <button
              style={{ background: 'transparent', color: '#f00', border: 'none', cursor: 'pointer' }} onClick={ () => {deleteSpace(space.spaceId, space.spaceName)}}> 🗑️ </button>
              )}

            </li>

          ))}
        </ul>
      ) : (
        <p>No spaces found.</p>
      )}

      </div>  

      {/* Only show browse link when on your own profile */}
      {!paramId && (
        <p>
          Discover online spaces! <Link to="/browse">Discover</Link>
        </p>
      )}
    </div>
  );
};
