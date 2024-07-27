import React, { useState } from 'react';
import './loginpage.css';
import backgroundimg from '/bg.jpg'; 
import Cookies from 'js-cookie';


const App: React.FC = () => {
  const [keeper, setKeeper] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageColor, setMessageColor] = useState<string>('');
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keeper, password }),
      });
      if (response.ok) {
		const jsonResponse = await response.json();
		const jwtToken = jsonResponse.message;
		console.log("Token:",jwtToken)
		Cookies.set('jwt', jwtToken, { 
          expires: 1,
          path: '/',
          secure: false, // Use `true` if you're in production
          sameSite: 'Strict', 
        });
        console.log('Login Successful:');
        setMessageColor('green');
        setMessage('Log in Successful!');
      } else {
		const errorData= await response.json();
		const errorMessage = errorData.message;
        // Handle login error
        console.error('Login Failed');
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
    
    if (keeper.length < 5 || keeper.length > 100){
		console.error('Keeper Length');
        setMessageColor('red');
        setMessage("Invalid Username Length");
        return;		
	}

	if (password.length < 5 || password.length > 100){
		console.error('Password Length');
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
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keeper, password }),
      });
      if (response.ok) {
        // Handle successful registration
        console.log('Registration successful');
        setMessageColor('green');
        setMessage('Registration Successful!');
        SucessfullRegistration();
      } else {
		const errorRegData= await response.json();
		const errorRegMessage = errorRegData.message;
        // Handle registration error
        console.error('Registration Failed');
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
	      <img src={backgroundimg} className="BackgroundImage"/>
	      <h1 id="page-title">Byrne Banking Solutions</h1>
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

export default App;