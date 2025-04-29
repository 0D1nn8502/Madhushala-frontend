import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./styles/Landing.css"; 
import { useNavigate } from "react-router-dom";
import { User } from "../types"; 


// User profile info returned after signup/signin // 
interface UserInfo {
  token?: string; 
  user?: User;    
  error?: string; 
}

interface decodedInfo {
  name: string; 
  email: string; 
  picture: string; 
}


export const Landing = () => { 
  const navigate = useNavigate(); 
  const [mode, setMode] = useState<"google" | "signup" | "signin">("google");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential) as decodedInfo;
      const newUser = {
        username: decoded.name,
        email: decoded.email,
        image: decoded.picture,
      };

      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/signup`, newUser);
      handleAuthSuccess(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Error during Google sign in");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/signup`, {
        username,
        email,
        password
      });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Error during signup");
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/signin`, {
        username,
        password
      });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message); 
    }
  };

  const handleAuthSuccess = (data: UserInfo) => {
    if (data.token && data.user) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate('/profile');
    }
  };

  return (
    <div className="landing-container"> 
      <div className="auth-box">
        <h1> Madhushala </h1>
        
        <div className="auth-tabs">
          <button
            className={mode === "google" ? "active" : ""}
            onClick={() => setMode("google")}
          >
            Google
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === "google" && (
          <div className="google-auth">
            <p>Sign in with your Google account</p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => setError("Google login failed")}
            />
          </div>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup} className="auth-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        )}

        {mode === "signin" && (
          <form onSubmit={handleSignin} className="auth-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        )}
      </div>
    </div>
  );
};
