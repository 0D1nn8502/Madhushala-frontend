import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google"; 


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>  
      <App /> 
    </GoogleOAuthProvider> 
  </StrictMode>,
)


// Checklist // 

// Tests (?) 

// SPACE JOINING 
// A user is visible as they join // 
// Everyone else present in that space is visible // 

// SPACE  
// A created space loads correctly with all the elements //  

// Element Behaviour // 

/// Signboards, on clicking, how can they display a linked iframe? /// 

// Chat Interface // 
/// Non-persistent chat session, everything before 80-100 messages flushed /// 
/// A user on joining, starts seeing the messages sent henceforth /// 