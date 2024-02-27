import React, { useCallback, useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { auth, database } from './firebase';
import { ref, get, set, remove } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './ReviewAllOrders.css';
import imageSrc from './BodyReference.jpg';
import dicut from './dicut.jpg';

import AWS from 'aws-sdk';



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
              // Extract and sort order IDs based on dates
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
          console.error('Error fetching data:', error);
      }
    };
  


    useEffect(() => {     
        fetchPendingOrders();
    }, []);
  
    const handleOrderClick = async (orderId) => {
      setSelectedOrderId(orderId);
      try {
        const orderSnapshot = await get(ref(database, `admin/Pending Orders/${orderId}/tableData`));
        const orderDetails = orderSnapshot.val();
  
        if (orderDetails) {
          setSelectedOrder(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [email, setEmail] = useState('');

    const handleFindUserData = useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated');
        return;
      }
      const userId = user.uid;
      const compRef = ref(database, `users/${userId}/Company`);
      const nameRef = ref(database, `company/${company}/${userId}/name`);
      const phoneRef = ref(database, `company/${company}/${userId}/mobile`);
      const emailRef = ref(database, `company/${company}/${userId}/username`)

      get(compRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setCompany(snapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching company name:', error);
        });
      
      get(nameRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setName(snapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching company name:', error);
        });
        
      get(phoneRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setPhoneNum(snapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching company name:', error);
        });

      get(emailRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setEmail(snapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching company name:', error);
        });

    }, [company]);




    const sendApprovedEmail = (recipientEmail) => {
      // Logic for notification email (completely separate content)
      handleFindUserData();
      const ses = new AWS.SES();
      const notificationEmailParams = {
        Destination: {
          ToAddresses: [recipientEmail],
        },
        Message: {
          Body: {
            Text: {
              Data: `Hello, \n
    This is a notification that Airos has approved an order. \n
    Order Number: ${selectedOrderId}  \n
    Name: ${name}
    Email: ${email}
    Phone Number: ${phoneNum}

    Regards, 
    Alleva Manufacturing
              `,
            },
          },
          Subject: {
            Data: 'Approved Order Notification',
          },
        },
        Source: 'leocthu@gmail.com',
      };
  
      ses.sendEmail(notificationEmailParams, (err, data) => {
        if (err) {
          console.error('Error sending notification email:', err);
        } else {
          console.log('Notification email sent successfully:', data);
        }
      });
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

            AWS.config.update({ 
              region: 'us-west-1', 
              apiVersion: 'latest',
              credentials: {
                accessKeyId: 'AKIAQUDNAIK6QT3D4WN3',
                secretAccessKey: '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',
              }
            });

            sendApprovedEmail('allevamanufacturing.eric@gmail.com');
            //when it comes to having Airos send the email to alleva medical, i just need to verify their identity in aws ses


          } catch (error) {
            console.error('Error approving order:', error);
          }
        }
    };

    const handleDelPending = async () => {
      if (selectedOrder) {
        try {

          // Delete the selected order from the pending orders node
          await remove(ref(database, `admin/Pending Orders/${selectedOrderId}`));
          
          // Clear the selected order from state
          setSelectedOrder(null);
          setSelectedOrderId(null); // Clear the selected order ID
          
          // Refresh the pending orders list
          await fetchPendingOrders();
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
          <div className="order-list">
            {pendingOrders.map((orderId, index) => (
              <div
                key={orderId}
                className='order-button'
                onClick={() => handleOrderClick(orderId)}
                style={{
                  backgroundColor: selectedOrderId === orderId ? 'lightblue' : 'initial',
                }}
              >
                Order {index + 1}: {orderId}
              </div>
            ))}
          </div>
        </div>
        {selectedOrder && (
          <div>
            <h2>Order Details</h2>
            <div className='tableContainer' style={{ marginTop: '50px', marginLeft: '21.5%'}}>
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
            <div className='btnContainer'>
              <div className="buttonContainer">
                <button className="removeBtn" onClick={handleDelPending}>Delete Order</button>
                <button className="approveBtn" onClick={handleApproval}>Approve Order</button>
              </div>
            </div>

            <img src={imageSrc} alt="bodypic" style={{ width: '53%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
            <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
          </div>
        )}
      </div>
    );
  }
  
  export default ReviewAllOrders;