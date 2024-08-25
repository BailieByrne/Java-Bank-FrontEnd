import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoginPage from './loginpage';
import Home from './home';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const autoLogin = async () => {
    const getRequestResponse = await fetch('https://82.41.19.127:8080/api/accs/1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('jwt')}`,
      },
    });
    if (getRequestResponse.ok) {
      const getData = await getRequestResponse.json();
      console.log('GET request data:', getData);
      setIsLoggedIn(true);
    } else {
      console.error('GET request failed:', getRequestResponse.statusText);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      autoLogin();
    }
  }, []);

  return (
    <div>
      {isLoggedIn ? <Home /> : <LoginPage/>}
    </div>
  );
};

export default App;
