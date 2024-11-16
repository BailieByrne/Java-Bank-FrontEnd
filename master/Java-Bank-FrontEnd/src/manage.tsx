import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './home.css';


interface ManagedUser {
  id: string;
  Roles: string;
}

interface ManagedAccount {
  id: string;
  RegisteredKeeper: string;
  AccountCreatedOn: string;
  Balance: number;
}

interface ManageProps {}

const Manage: React.FC<ManageProps> = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [managedUser, setManagedUser] = useState<ManagedUser | null>(null);
  const [managedAccounts, setManagedAccounts] = useState<ManagedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<ManagedAccount | null>(null);
  const [updatedBalance, setUpdatedBalance] = useState<string>('');
  const [updatedRegisteredKeeper, setUpdatedRegisteredKeeper] = useState<string>('');
  const [updatedAccountCreatedOn, setUpdatedAccountCreatedOn] = useState<string>('');

  useEffect(() => {
    const fetchManagedUser = async () => {
      try {
        const response = await fetch(`https://localhost:8080/api/dev/manage/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Cookies.get('jwt')}`
          }
        });

        if (response.ok) {
          const fetchedUser = await response.json();
          console.log('Fetched Managed User:', fetchedUser);
          setManagedUser(fetchedUser);
        } else {
          throw new Error('User Does Not Exist');
        }
      } catch (error) {
        console.error('Failed To Fetch Managed User', error);
		navigate('/home')
      }
    };

    fetchManagedUser();
  }, [username]);

  useEffect(() => {
    const fetchManagedAccounts = async () => {
      if (!managedUser?.id) return;

      try {
        console.log('Fetching accounts for user ID:', managedUser.id);
        const response = await fetch(`https://localhost:8080/api/accs/${managedUser.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Cookies.get('jwt')}`
          }
        });

        if (response.ok) {
          const fetchedAccounts = await response.json();
          console.log('Fetched Accounts:', fetchedAccounts);
          setManagedAccounts(Array.isArray(fetchedAccounts) ? fetchedAccounts : [fetchedAccounts]);
        } else {
          throw new Error('Could Not Fetch Accounts');
        }
      } catch (error) {
        console.error('Failed To Fetch Accounts', error);
      }
    };

    fetchManagedAccounts();
  }, [managedUser]);

  const handleRowClick = (account: ManagedAccount) => {
    setSelectedAccount(account);
    setUpdatedBalance(account.Balance.toFixed(2));
    setUpdatedRegisteredKeeper(account.RegisteredKeeper);
    setUpdatedAccountCreatedOn(account.AccountCreatedOn);
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedBalance(e.target.value);
  };

  const handleRegisteredKeeperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedRegisteredKeeper(e.target.value);
  };

  const handleAccountCreatedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedAccountCreatedOn(e.target.value);
  };

  const handleUpdate = async () => {
    if (!selectedAccount) return;

    const updatedAccount = {
      ...selectedAccount,
      Balance: parseFloat(updatedBalance),
      RegisteredKeeper: updatedRegisteredKeeper,
      AccountCreatedOn: updatedAccountCreatedOn
    };

    try {
      console.log(JSON.stringify(updatedAccount));
      const response = await fetch(`https://localhost:8080/api/dev/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`
        },
        body: JSON.stringify(updatedAccount)
      });

      if (response.ok) {
        console.log('Account updated successfully');
        // Optionally, refresh the accounts list after update
        setManagedAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.id === selectedAccount.id ? updatedAccount : account
          )
        );
        setSelectedAccount(null); // Clear selection after update
      } else {
        throw new Error('Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div>
      <h1>Managing {username}</h1>
      {managedUser ? (
        <div>
          <p>Role: {managedUser.Roles}</p>
          <h2>Managed Accounts</h2>
          {managedAccounts.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registered Keeper</th>
                  <th>Account Created On</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {managedAccounts.map((account) => (
                  <tr key={account.id} onClick={() => handleRowClick(account)}>
                    <td>{account.id}</td>
                    <td>{account.RegisteredKeeper}</td>
                    <td>{new Date(account.AccountCreatedOn).toLocaleString()}</td>
                    <td>{account.Balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No managed accounts found.</p>
          )}
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
      
      {selectedAccount && (
        <div>
          <h3>Edit Account Details</h3>
          <p><strong>Account ID:</strong> {selectedAccount.id}</p>
          <p><strong>Current Balance:</strong> {selectedAccount.Balance.toFixed(2)}</p>
          <label>
            New Balance: 
            <input
              type="number"
              value={updatedBalance}
              onChange={handleBalanceChange}
              step="0.01"
            />
          </label>
          <br />
          <label>
            Registered Keeper: 
            <input
              type="text"
              value={updatedRegisteredKeeper}
              onChange={handleRegisteredKeeperChange}
            />
          </label>
          <br />
          <label>
            Account Created On: 
            <input
              type="datetime-local"
              value={updatedAccountCreatedOn}
              onChange={handleAccountCreatedOnChange}
            />
          </label>
          <br />
          <button onClick={handleUpdate}>Update</button>
        </div>
      )}
      
      <button onClick={handleBack}>Back</button>
    </div>
  );
};

export default Manage;
