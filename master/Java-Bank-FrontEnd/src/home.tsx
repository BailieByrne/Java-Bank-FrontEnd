import React, { useState, useEffect } from 'react';
import './home.css';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, deposit, withdraw } from './utils/authUtil';

const HomePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userList, setUserList] = useState<string[]>([]);
  const [managedUser, setManagedUser] = useState(null);
  const [isManaging, setIsManaging] = useState(false);
  const [authority, setAuthority] = useState(() => window.sessionStorage.getItem("Auth") || "");
  const [userData, setUserData] = useState<any[]>([]);  // Array for accounts
  const [selectedAccount, setAccount] = useState(null);
  const [depositWithdrawAmount, setDepositWithdrawAmount] = useState(0);
  const navigate = useNavigate();
  const isAdmin = authority === "ADMIN";
  const correctUser = window.sessionStorage.getItem("Username") === username;

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = window.sessionStorage.getItem("UserID");
      if (userId && correctUser) {
        try {
          const data = await getData(userId);
          console.log('Fetched User Data:', data); // Log the structure of the response
          setUserData(data); // Directly set the array of accounts
        } catch (error) {
          console.error("Failed to fetch user data", error);
          sessionStorage.clear();
          navigate('/');
        }
      } else {
        console.error("Failed To Login");
        navigate('/');
      }
    };
    fetchUserData();
  }, [navigate]);

  const ManageUser = async (user: string) => {
    navigate('/manage/' + user);
  };

  const AdminGetUsers = async () => {
    try {
      const response = await fetch('https://localhost:8080/api/dev/getusers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${Cookies.get('jwt')}` }
      });
      if (response.ok) {
        const fetchedUserList = await response.json();
        console.log(fetchedUserList);
        setUserList(fetchedUserList);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Failed To Fetch', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('https://localhost:8080/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Cookies.get('jwt')}` }
      });
      Cookies.remove('jwt');
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };


  
  return (
    <div>
      {isManaging ? (
        <Manage user={managedUser} />
      ) : (
        <div>
          {isAdmin ? (
            <>
              <h1 id="page-title">You Are Logged In As {username}</h1>
              <p className="AuthClass">{authority}</p>
              <button onClick={AdminGetUsers}>View Logged-In Users</button>
              <button id="buttonLO" onClick={logout} className="LogoutButton">Logout</button>
              {userList.length > 0 ? (
                <table id="LoggedInTable">
                  <thead>
                    <tr>
                      <th>LoggedInUsers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user, index) => (
                      user !== 'Dev' && (
                        <tr id="selectable" key={index}>
                          <td onClick={() => ManageUser(user)}>{user}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found.</p>
              )}
            </>
          ) : (
            <>
              <h1 id="page-title">You Are Logged In {username}</h1>
              {userData && userData.length > 0 ? ( // Render if userData has accounts
                <div>
                  <p>Your Accounts:</p>
                  <table>
                    <thead>
                      <tr>
					  	<th>Account ID</th>
                        <th>Registered Keeper</th>
                        <th>Balance</th>
                        <th>Account Created On</th>
                      </tr>
                    </thead>
					<tbody>
					  {userData.map((account, index) => (
					    <tr
					      key={index}
					      onClick={() => setAccount(account.id)}
					      style={{
					        cursor: 'pointer',
					        backgroundColor: selectedAccount === account.id ? 'darkgrey' : 'transparent', // Optional, to highlight the selected row
					      }}
					    >
					      <td>
					        {selectedAccount === account.id ? (
					          `>> ${account.id}`
					        ) : (
					          account.id
					        )}
					      </td>
					      <td>{account.RegisteredKeeper}</td>
					      <td>£{account.Balance}</td>
					      <td>{account.AccountCreatedOn ? account.AccountCreatedOn.substring(0, 10) : 'N/A'}</td>
					    </tr>
					  ))}
					</tbody>
                  </table>
				  <form id="inputform">
				  <label>Amount:</label>
				  <input
					type="number"
					name="amount"
					value={depositWithdrawAmount}
					onChange={(e) => setDepositWithdrawAmount(e.target.value)}
		            required
					/>
				  </form>
				  <div id="WithdrawDepositButtons">
					  <button onClick= {() => withdraw(window.sessionStorage.getItem("UserID"),selectedAccount,depositWithdrawAmount)}>Withdraw</button>
					  <button onClick= {() => deposit(window.sessionStorage.getItem("UserID"),selectedAccount,depositWithdrawAmount)}>Deposit</button>
				  </div>
                </div>
              ) : (
                <p>Loading accounts...</p>
              )}
              <button id="buttonLO" onClick={logout} className="LogoutButton">Logout</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
