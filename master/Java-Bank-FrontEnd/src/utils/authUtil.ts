import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';


export const autoLogin = async (id: string) => {
    const getRequestResponse = await fetch(`https://localhost:8080/api/accs/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('jwt')}`,
      },
    });
    if (getRequestResponse.ok) {
      const data = await getRequestResponse.json();
      useNavigate('/home/'+window.sessionStorage.getItem("Username")); // Redirect to Home after successful auto-login
    } else {
      useNavigate('/'); // Redirect to login page if auto-login fails
    }
  };
  

export const getData = async (id: string) => {
    const getRequestResponse = await fetch(`https://localhost:8080/api/accs/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('jwt')}`,
      },
    });
    if (getRequestResponse.ok) {
      const data = await getRequestResponse.json();
	  return data;
	  }else {
	      console.error("Failed To Login");
	      useNavigate('/');
	      }
	    };