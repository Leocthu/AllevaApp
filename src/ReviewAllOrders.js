import React, { useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { database } from './firebase';
import { ref, get, set, remove } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './ReviewAllOrders.css';
import imageSrc from './BodyReference.jpeg';
import dicut from './dicut.jpg';

function ReviewAllOrders() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null); // Store selected order ID
    
    
    const fetchPendingOrders = async () => {
        try {
            const pendingOrdersRef = ref(database, 'admin/Pending Orders');
            const pendingOrdersSnapshot = await get(pendingOrdersRef);
            const pendingOrdersData = pendingOrdersSnapshot.val();
    
            if (pendingOrdersData) {
                const orderIds = Object.keys(pendingOrdersData);
                setPendingOrders(orderIds);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {     
        fetchPendingOrders();
    }, []);
  
    const handleOrderClick = async (orderId) => {
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

    const handleApproval = async () => {
        if (selectedOrder) {
          try {
            // Create a reference to the approved orders node
            const approvedOrdersRef = ref(database, `admin/Approved Orders/${selectedOrderId}`);
            
            // Push the selected order to the approved orders node
            await set(approvedOrdersRef, selectedOrder);
            
            // Delete the selected order from the pending orders node
            await remove(ref(database, `admin/Pending Orders/${selectedOrderId}`));
            
            // Clear the selected order from state
            setSelectedOrder(null);
            setSelectedOrderId(null); // Clear the selected order ID
            
            // Refresh the pending orders list
            fetchPendingOrders();
          } catch (error) {
            console.error('Error approving order:', error);
          }
        }
      };
  
    return (
      <div>
        <header className="login-header" style={{ backgroundColor: 'lightblue' }}>
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
          <div style={{ marginRight: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            <HamburgerMenu />
          </div>
        </header>
        <div>
          <h2>Pending Orders</h2>
          <ul style={{listStyle: 'none'}}>
            {pendingOrders.map((orderId, index) => (
              <li 
                key={orderId} 
                className='order-button'
                onClick={() => handleOrderClick(orderId)}
              >
                Order {index + 1}: {orderId}
              </li>
            ))}
          </ul>
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
            <button className="approveBtn" onClick={handleApproval} style={{display: 'flex', marginLeft: '883px', marginTop: '15px', padding: '15px'}}>Approve Order</button>
            <img src={imageSrc} alt="bodypic" style={{ width: '22%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
            <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
          </div>
        )}
      </div>
    );
  }
  
  export default ReviewAllOrders;