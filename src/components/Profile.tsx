import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { Link } from 'react-router-dom';
import './styles/Profile.css'; 
import { useNavigate } from 'react-router-dom';
import { useSpace } from '../context/SpaceContext';


export const Profile: React.FC = () => {
  const navigate = useNavigate();  
  const [user, setUser] = useState<any>(null); 
  const [spaces, setSpaces] = useState<any[]>([]); 
  const {setSpaceData} = useSpace(); 
  
  const fetchUserProfile = async() => {
    const token = localStorage.getItem('token'); 

    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/user/profile`, {
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      }); 

      localStorage.setItem('user', JSON.stringify(response.data)); 
      setUser(response.data); 
      setSpaces(response.data.spaces || []);  

    } catch (error) {
      console.error("Error fetching user profile"); 
    }
  }

  function changeProfilePic() {
    console.log("Want to change Pic");
  }

  async function createSpace () {

    try {
      // Pass Callback to update local storage after space creation? // 
      navigate('/space');    
      
    } catch (error) {
      console.error("Error creating space: ", error) 
    }

  }

  async function changeDescription () {
    
  }


  async function joinSpace(spaceId:string) {
    const token = localStorage.getItem('token'); 
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/space/join/${spaceId}`, {
        headers: {
          "Authorization": `Bearer ${token}` 
        }
    });

    setSpaceData(response.data);  
    navigate(`/join/${spaceId}`); // or window.location.href ? // 

    } catch (error) {
      console.error("Error joining space:", error); 
    }
  }


  useEffect(() => {
    // Fetch user profile from the backend when component mounts
    fetchUserProfile();
  }, []); 

  if (!user) {
    return <div> Loading ... </div>
  }

  // AWS bucket image url provided for user image / default //  
  
  return (
    <div className="profile-container"> 

      <h2> {user.username} </h2>
      <div className='image-container'> 
        <img src={user.image} alt="Profile" />   
      </div>  

      <button onClick={changeProfilePic}> Change </button> 

      <p> Description: {" Enter a short description "} </p>

      <button onClick={changeDescription}> Change </button> 

      <h2>Your Spaces</h2>

      {spaces && spaces.length > 0? (
      <ul>

        {spaces.map((space, index) => (

            <li key={index}>
                <button onClick={() => joinSpace(space.spaceId)}>
                  {space.spaceName}
                </button>
            </li>

        ))}    

      </ul>   

      ) : (
        <p>No spaces found. Create a new space to get started!</p>
      )} 

      <p> Discover online spaces! <Link to={'/browse'}> Discover </Link>  </p> 

      <button 
      onClick={createSpace}
      disabled={user.spaces.length > 0}
      > 
       
      Create space </button>  

    </div>
  );
};
