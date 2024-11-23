import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import './loginpage.css';
import backgroundimg from '/bg.jpg';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [keeper, setKeeper] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageColor, setMessageColor] = useState<string>('');
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useEffect(() => {
      const token = Cookies.get('jwt');
      if (token && window.sessionStorage.getItem("Username")) {
        navigate("/home/"+window.sessionStorage.getItem("Username"));
      }
    }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('https://localhost:8080/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keeper, password }),
      });
      if (response.ok) {
        const token = await response.json();
        Cookies.set('jwt', token.message, { 
          expires: 1,
          path: '/',
          secure: true,
          sameSite: 'Strict',
        });
        window.sessionStorage.setItem("Username", (jwtDecode(JSON.stringify(token.message))).sub);
        window.sessionStorage.setItem("UserID", (jwtDecode(JSON.stringify(token.message))).UUID);
        window.sessionStorage.setItem("Auth", (jwtDecode(JSON.stringify(token.message))).auth);
        setMessageColor('green');
        setMessage('Log in Successful!');
        navigate('/home/'+window.sessionStorage.getItem("Username"));
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message;
        setMessageColor('red');
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setMessageColor('red');
      setMessage('Error! ' + error);
    }
  };

  const handleRegisterClick = () => {
    setShowConfirmPassword(true);
    setIsRegistering(true);
    setMessage('');
    setMessageColor('');
  };

  const SucessfullRegistration = () => {
    setShowConfirmPassword(false);
    setIsRegistering(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (keeper.length < 5 || keeper.length > 100) {
      setMessageColor('red');
      setMessage("Invalid Username Length");
      return;    
    }

    if (password.length < 5 || password.length > 100) {
      setMessageColor('red');
      setMessage("Invalid Password Length");
      return;    
    }
    
    if (password !== confirmPassword) {
      setMessageColor('red');
      setMessage('Passwords do not match');
      return;
    }   
    
    try {
      const response = await fetch('https://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keeper, password }),
      });
      if (response.ok) {
        setMessageColor('green');
        setMessage('Registration Successful!');
        SucessfullRegistration();
        navigate('/'); // Redirect to login page after successful registration
      } else {
        const errorRegData = await response.json();
        const errorRegMessage = errorRegData.message;
        setMessageColor('red');
        setMessage(errorRegMessage);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setMessageColor('red');
      setMessage('Error! ' + error);
    }
  };

  return (
    <div>
      <img src={backgroundimg} className="BackgroundImage" alt="Background"/>
      <h1 id="loginpage-title" className="textClass">Byrne Banking Solutions</h1>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={keeper}
            onChange={(e) => setKeeper(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {showConfirmPassword && (
          <div>
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={isRegistering}
            />
          </div>
        )}
        <div>
          {isRegistering ? (
            <>
              <button type="submit">Submit Registration</button>
              <button type="button" onClick={SucessfullRegistration} className="Registerbutton">Back To Login</button>
            </>
          ) : (
            <>
              <button type="submit">Login</button>
              <button type="button" onClick={handleRegisterClick} className="Registerbutton">Register</button>
            </>
          )}
        </div>
      </form>
      <p id="status-text" style={{ color: messageColor }}>{message}</p>
      <p id="foot-note">Because Your Money Matters</p>
    </div>
  );
};

export default LoginPage;
