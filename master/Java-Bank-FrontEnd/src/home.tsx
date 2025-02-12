import React, { useState, useEffect } from 'react';
import './home.css';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, deposit, withdraw, getUserList } from './utils/authUtil';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QNyxiAZghTodUYpCk8mOT9oLxJuTjcDf8jg35XNoVY2oqmW3bFrqmadDIdP0tBvoYC1Qdg6tP6qPuVFiEKmtl0000BmkG1JLH');
const apiHome = "https://localhost:8080"

const HomePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userList, setUserList] = useState<string[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [depositWithdrawAmount, setDepositWithdrawAmount] = useState<number>(0);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string>('');
  const [confirmPayment, setConfirmPayment] = useState<boolean>(false);
  const [errorNote, setError] = useState<string>("");
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();
  const isAdmin = window.sessionStorage.getItem("Auth") === "ADMIN";

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = window.sessionStorage.getItem("UserID");
      if (userId) {
        try {
          const data = await getData(userId);
          setUserData(data);
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

    const getOnlineUsers = async () => {
      const users = await getUserList();
      setUserList(users);
    };

    fetchUserData();
    getOnlineUsers();
  }, [navigate]);

  const createPaymentIntent = async (amount: number) => {
    if (amount <= 0.3) {
      setError("Value Must Be Greater Than £0.30");
      return null;
    }

    if (selectedAccount == null) {
      setError("Select An Account To Deposit");
      return null;
    }

    try {
      const response = await fetch(`${apiHome}/api/payment/deposit/${window.sessionStorage.getItem("UserID")}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
        body: JSON.stringify({ amount: amount * 100 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentIntentClientSecret(data.clientSecret);
      } else {
        console.error("PAYMENT FAILED");
      }
    } catch (error) {
      console.error("Error creating payment intent", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('Card Element not found');
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentClientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: username },
        },
      });

      if (error) {
        console.error('Payment failed:', error.message);
        setError(error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        deposit(window.sessionStorage.getItem("UserID"), selectedAccount, paymentIntent.id);
      }
    } catch (error) {
      console.error("Payment submission error", error);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiHome}/auth/logout`, {
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
    <div className="home-container">
      <h1 id="page-title">
        You Are Logged In {username}
      </h1>

      {userData.length > 0 ? (
        <div className="accounts-section">
          <p>Your Accounts:</p>
          
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Registered Keeper</th>
                <th>Balance</th>
                <th>Account Created On</th>
                <th>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((account, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedAccount(account.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedAccount === account.id ? 'darkgrey' : 'transparent',
                  }}
                >
                  <td>{account.id}</td>
                  <td>{account.RegisteredKeeper}</td>
                  <td>£{(parseFloat(account.Balance) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                  <td>{account.AccountCreatedOn?.substring(0, 10) || 'N/A'}</td>
                  <td>PLACEHOLDER</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form id="inputform" onSubmit={handleSubmit} className="payment-form">
            <label>Deposit Amount:</label>
            <div id="currency-input">
              <span>£</span>
              <input
                type="number"
                name="amount"
                id="amountInput"
                value={depositWithdrawAmount}
                onChange={(e) => setDepositWithdrawAmount(Number(e.target.value))}
                required
              />
            </div>

            <CardElement />

            {confirmPayment ? (
              <div className="payment-confirmation">
                <p>Your Card Will Be Debited £{depositWithdrawAmount}</p>
                <button
                  id="ConfirmPaymentButton"
                  type="submit"
                  onClick={() => createPaymentIntent(depositWithdrawAmount)}
                >
                  Confirm Payment
                </button>
              </div>
            ) : (
              <button
                type="submit"
                onClick={() => {
                  createPaymentIntent(depositWithdrawAmount);
                  setConfirmPayment(true);
                }}
              >
                Pay With Stripe
              </button>
            )}

            <button
              type="submit"
              onClick={() => {
                withdraw(window.sessionStorage.getItem("UserID"), selectedAccount, depositWithdrawAmount);
              }}
            >
              Withdraw
            </button>
          </form>

          <p className="errorNote">{errorNote}</p>
        </div>
      ) : (
        <p>Loading accounts...</p>
      )}

      {isAdmin && (
        <form id="ManageBox" className="manage-section">
          <h3>MANAGE USERS</h3>
          <p>Online Users:</p>
          <select>
            {userList.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button>Manage</button>
        </form>
      )}

      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default HomePage;