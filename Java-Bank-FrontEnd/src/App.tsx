import React, { useState } from 'react';
import './loginpage.css';
import Cookies from 'js-cookie';


const App: React.FC = () => {
  const [keeper, setKeeper] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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
		const jwtToken = await response.text();
		Cookies.set('jwt', jwtToken, { 
          expires: 1, // Cookie expiration (in days)
          path: '/',   // Cookie path
          secure: false, // Use `true` if you're in production
          sameSite: 'Strict', // or 'Lax' based on your needs
        });

        console.log('Login successful:');
      } else {
        // Handle login error
        console.error('Login failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
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
      } else {
        // Handle registration error
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div>
      <h1 id="page-title">Byrne Banking Solutions</h1>
      <form onSubmit={handleLogin}>
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
        <div>
          <button type="submit">Login</button>
          <button type="button" onClick={handleRegister} className="Registerbutton">
            Register
          </button>
        </div>
      </form>
      <p id="foot-note">Because Your Money Matters</p>
    </div>
    
  );
};

export default App;