import React, { useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { database, auth } from './firebase';
import { ref, get } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './ReviewAllOrders.css';
import imageSrc from './BodyReference.jpg';
import dicut from './dicut.jpg';

function UserProfile() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Store selected order ID


  useEffect(() => {
    fetchPendingOrders();
    fetchApprovedOrders();
    fetchUserOrders();
  }, []);

  

  const fetchUserOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is currently logged in.");
        return;
      }
      const userId = user.uid;
  
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
  
      let companyName = "";
      let chainName = "";
  
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        companyName = userData.company;
        chainName = userData.chain; // Assuming chain info is stored in the user data
        console.log("Company Name:", companyName);
        console.log("Chain Name:", chainName);
  
        const userOrdersRef = ref(database, `company/${companyName}/chains/${chainName}/${userId}/Orders`);
        const userOrdersSnapshot = await get(userOrdersRef);
        const userOrdersData = userOrdersSnapshot.val();
  
        if (userOrdersData) {
          console.log("User Orders:", userOrdersData);
          setUserOrders(userOrdersData);
        } else {
          setUserOrders([]);
        }
      } else {
        console.log('User data not found.');
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };
  

  const fetchPendingOrders = async () => {
    try {
      const pendingOrdersRef = ref(database, 'admin/Pending Orders');
      const pendingOrdersSnapshot = await get(pendingOrdersRef);
      const pendingOrdersData = pendingOrdersSnapshot.val();

      if (pendingOrdersData) {
        const orderIds = Object.keys(pendingOrdersData);
        const sortedOrderIds = orderIds.sort((a, b) => {
          const dateA = new Date(a.split('-').slice(-3).join('-'));
          const dateB = new Date(b.split('-').slice(-3).join('-'));
          return dateA - dateB;
        });
        console.log(sortedOrderIds);
        setPendingOrders(sortedOrderIds);
      
      } else {
        setPendingOrders([]);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const fetchApprovedOrders = async () => {
    try {
      const approvedOrdersRef = ref(database, 'admin/Approved Orders');
      const approvedOrdersSnapshot = await get(approvedOrdersRef);
      const approvedOrdersData = approvedOrdersSnapshot.val();

      if (approvedOrdersData) {
        const orderIds = Object.keys(approvedOrdersData);
        setApprovedOrders(orderIds);
      } else {
        setApprovedOrders([]);
      }
    } catch (error) {
      console.error('Error fetching approved orders:', error);
    }
  };


  const AhandleOrderClick = async (orderId) => {
    setSelectedOrderId(orderId);
    try {
      const orderSnapshot = await get(ref(database, `admin/Approved Orders/${orderId}`));
      const orderDetails = orderSnapshot.val();

      if (orderDetails) {
        setSelectedOrder(orderDetails);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const PhandleOrderClick = async (orderId) => {
    setSelectedOrderId(orderId);
    try {
      const orderSnapshot = await get(ref(database, `admin/Pending Orders/${orderId}`));
      const orderDetails = orderSnapshot.val();

      if (orderDetails) {
        setSelectedOrder(orderDetails);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const matchingPendingOrders = [];
  for (const orderId of pendingOrders) {
    if (userOrders.hasOwnProperty(orderId)) {
      matchingPendingOrders.push(orderId);
    }
    else {
      console.log('no matching orders');
    }
  }

  const matchingApprovedOrders = [];
  for (const orderId of approvedOrders) {
    if (userOrders.hasOwnProperty(orderId)) {
      matchingApprovedOrders.push(orderId);
    }
  }


  return (
    <div>
      <header className="login-header" style={{ backgroundColor: 'lightblue' }}>
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
          <div style={{ marginRight: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            <HamburgerMenu />
          </div>
      </header>

      <div>
        <h2>Current Pending Orders</h2>
        <div className="order-list">
          {matchingPendingOrders.map((orderId, index) => (
            <div
              key={orderId}
              className='order-button'
              onClick={() => PhandleOrderClick(orderId)}
              style={{
                backgroundColor: selectedOrderId === orderId ? 'lightblue' : 'initial',
              }}
            >
              Pending Order {index + 1}: {orderId}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Approved Orders</h2>
        <div className="order-list">
          {matchingApprovedOrders.map((orderId, index) => (
            <div
              key={orderId}
              className='order-button'
              onClick={() => AhandleOrderClick(orderId)}
              style={{
                backgroundColor: selectedOrderId === orderId ? 'lightblue' : 'initial',
              }}
            >
              Approved Order {index + 1}: {orderId}
            </div>
          ))}
        </div>
      </div>


        {selectedOrder && (
          <div>
              <h2>Order Details</h2>
              <div className='tableContainer' style={{ marginTop: '50px', marginRight: '300px'}}>
                  <table className='order-table'>
                      <thead>
                          <tr>
                          <th>Name</th>
                          <th>Left Measurement</th>
                          <th>Right Measurement</th>
                          </tr>
                      </thead>
                      <tbody>
                          {Object.values(selectedOrder).map((item, index) => (
                          <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.userInput1}</td>
                              <td>{item.userInput2}</td>
                          </tr>
                          ))}
                      </tbody>
                  </table>
                
              </div>
              <img src={imageSrc} alt="bodypic" style={{ width: '22%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
              <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
          </div>
        )}
    </div>
  );
}

export default UserProfile;
