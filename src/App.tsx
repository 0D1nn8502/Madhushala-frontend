import { BrowserRouter, Routes, Route } from 'react-router-dom' 
import './App.css'
import {Landing} from './components/Landing';
import {Profile} from './components/Profile'; 
import Space from './components/Scenes/Default';
import JoinedSpace from './components/Scenes/JoinSpace';
import { SpaceProvider } from './context/SpaceContext';
import { BrowseSpaces } from './components/BrowseSpaces';

function App() {

  // -> /space : space creation page
  // -> 

  return (
    <SpaceProvider> 
    <BrowserRouter> 

      <Routes> 
        <Route path = "/" element = {<Landing/>}/>  
        <Route path="/profile/:userId?" element={<Profile/>} /> 
        <Route path="/space" element={<Space/>} />  
        <Route path="/join/:spaceId" element={<JoinedSpace/>} /> 
        <Route path="/browse" element={<BrowseSpaces/>} /> 
      </Routes>

    </BrowserRouter>
    </SpaceProvider> 
  )
}


export default App; 
