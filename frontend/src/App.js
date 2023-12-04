import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './site.css';
import './App.css';
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/check-auth', { withCredentials: true })
      .then((response) => {
        setAuthenticated(response.data.authenticated);

        if (response.data.authenticated) {
          axios.get('http://localhost:3001/user', { withCredentials: true })
            .then((userResponse) => setUser(userResponse.data));

          axios.get('http://localhost:3001/api/invoices', { withCredentials: true })
            .then((invoicesResponse) => setInvoices(invoicesResponse.data));
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Authentication check error:', error);
        setLoading(false);
      });
  }, []);

  const handleTriggerAutomation = () => {
    axios.post('http://localhost:3001/api/trigger-zapier', {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data.message);
      });
  };

  const handleLogout = () => {
    axios.get('http://localhost:3001/logout', { withCredentials: true })
      .then(() => {
        setUser(null);
        setAuthenticated(false);
      })
      .catch((error) => console.error('Logout error:', error));
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : authenticated ? (
        <div>
          <h2 id='u1'>Hello!,{user?.displayName || 'User'}!</h2>
         
          <h3>Your Due Invoices:</h3>
          <ul>
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                Amount: ${invoice.amount}, Due Date: {invoice.dueDate}, Recipient: {invoice.recipient}
              </li>
            ))}
          </ul>
          <button onClick={handleTriggerAutomation}>Trigger Automation</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div id='main1'>
          <h2>Invoice Reminder</h2>
          <a href='http://localhost:3001/auth/google' id='main2'>Login with Google</a>
        </div>
      )}
    </div>
  );
};

export default App;