import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {autoLogin} from './utils/authUtil';
import Cookies from 'js-cookie';
import LoginPage from './loginpage';
import Home from './home';
import Manage from './manage';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe('pk_test_51QNyxiAZghTodUYpCk8mOT9oLxJuTjcDf8jg35XNoVY2oqmW3bFrqmadDIdP0tBvoYC1Qdg6tP6qPuVFiEKmtl0000BmkG1JLH');

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [getData, setGetData] = useState(null);
  const navigate = useNavigate();

  
  
  
  
  
  return (
	<Elements stripe={stripePromise}>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
	  <Route path="/home" element={<LoginPage/>}/>
      <Route path="/home/:username" element={<Home/>} />
	  <Route path="/manage/:username" element= {<Manage/>}/>
    </Routes>
	</Elements>
  );
};

// Wrap the App component in Router to provide routing context
const MainApp: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default MainApp;
