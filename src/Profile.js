import React, { useState } from 'react';
import { auth, database } from './firebase'; // Import your Firebase authentication module
import { ref, get } from 'firebase/database'; // Import necessary modules for Firebase Realtime Database


function Profile() {
    const [searchId, setSearchId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState(null);
  
    const handleSearch = async () => {
      if (!searchId) return;
  
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('User not authenticated');
          return;
        }
        
        const userId = user.uid;
        const orderRef = ref(database, `users/${userId}/orders/${searchId}`);
        const orderSnapshot = await get(orderRef);
  
        if (orderSnapshot.exists()) {
          setSearchedOrder(orderSnapshot.val());
        } else {
          setSearchedOrder(null);
          console.log('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };
  
    return (
      <div>
        <h1>Profile Page</h1>
        <div>
          <input
            type="text"
            placeholder="Enter Order ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {searchedOrder && (
          <OrderTable orderData={searchedOrder} />
        )}
      </div>
    );


    function OrderTable({ orderData }) {
        return (
          <div>
            <h2>Order Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Body Part</th>
                  <th>Left Measurement</th>
                  <th>Right Measurement</th>
                </tr>
              </thead>
              <tbody>
                {orderData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.userInput1}</td>
                    <td>{row.userInput2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
  }
  