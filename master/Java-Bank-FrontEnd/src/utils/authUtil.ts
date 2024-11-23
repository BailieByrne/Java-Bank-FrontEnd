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
  

  export const deposit = async (ownerid: string, accountid: string, stripeid: string) => {
    const requestBody = JSON.stringify({
      ownerID: ownerid,
      accountID: accountid,
      stripeID: stripeid,
    });

	console.log(accountid);
    // Send the POST request with the appropriate headers and body
    const getRequestResponse = await fetch(`https://localhost:8080/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Make sure to specify the correct content type
        'Authorization': `Bearer ${Cookies.get('jwt')}`, // Use JWT token for authorization
      },
      body: requestBody, // Include the stringified body
    });
	
    // Check if the request was successful
	console.log(getRequestResponse.status);
    if (getRequestResponse.ok) {
	  window.location.reload() // Reload the page to reflect the changes
      return true; // Return true indicating the deposit was successful
    } else {
      console.error("Failed to deposit"); // Log any errors to the console
      return false; // Return false indicating the deposit failed
    }
  };
		
		
export const withdraw = async (ownerid: string, accountid : string, amount : string) => {
    const getRequestResponse = await fetch(`https://localhost:8080/api/accs/withdraw/${ownerid}/${accountid}/${amount}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('jwt')}`,
      },
    });
    if (getRequestResponse.ok) {
	  window.location.reload();
	  return true;
	  }else {
	      console.error("Failed To Deposit");
	      useNavigate('/');
		  return false;
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

