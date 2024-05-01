import React, { useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { database, auth } from './firebase';
import { ref, get, set, remove } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './ReviewAllOrders.css';
import imageSrc from './BodyReference.jpeg';
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
        const orderSnapshot = await get(ref(database, `admin/Pending Orders/${orderId}`));
        const orderDetails = orderSnapshot.val();
  


        if (orderDetails) {
          setSelectedOrder(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    //just a comment
    

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
            const user = auth.currentUser;
            if (!user){
              console.log('User not authenticated');
              return;
            }
            const userId = user.uid;
            let compName = "";
            let name = "";
            const companyRef = await ref(database, `users/${userId}`);
            get(companyRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const userData = snapshot.val();
                  compName = userData.Company; // Set CompanyName inside the scope
                } else {
                  console.log('User data not found.');
                }
              })
              .catch((error) => {
                console.error('Error retrieving company:', error);
              });
            
            const nameRef =  await ref(database, `company/${compName}/${userId}/name`)
            get(nameRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const usersName = snapshot.val();
                  name = usersName.name; // Set CompanyName inside the scope
                } else {
                  console.log('User data not found.');
                }
              })
              .catch((error) => {
                console.error('Error retrieving name:', error);
              });  

            
            
            const emailRef = ref(database, `company/${compName}/${userId}/username`);
            get(emailRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const emailValue = snapshot.val();
                console.log(emailValue);
                AWS.config.update({ 
                  region: 'us-west-1', 
                  apiVersion: 'latest',
                  credentials: {
                    accessKeyId: 'AKIAQUDNAIK6QT3D4WN3',
                    secretAccessKey: 'Ra8M1QAZzYs1ySj/uDRjW3VxvDiUPg4xyqJ+2k7a',
                  }
                }); // Replace 'your-region' with the appropriate AWS region
            
                // Create a new SES instance
                const ses = new AWS.SES();
        
                const emailParams = {
                  Destination: {
                    ToAddresses: [emailValue], 
                  },
                  Message: {
                    Body: {
                      Text: {
                        Data: `
                          Hello ${name}, \n
                          
                          Order ${selectedOrderId} has been approved! If you have any questions or need to make any changes to the order, please contact us at ###-###-####. \n
                          
                          Best Regards, 
                          Alleva Manufacturing
                        `,
                      },
                    },
                    Subject: {
                      Data: 'Order Confirmation',
                    },
                  },
                  Source: 'allevamanufacturing.eric@gmail.com', // Replace with your SES verified email address
                };
        
                ses.sendEmail(emailParams, (err, data) => {
                  if (err) {
                    console.error('Error sending email:', err);
                  } else {
                    console.log('Email sent successfully:', data);
                  }
                });
                // Now you can use the emailValue to send an email to the recipient
                // using AWS SES or any other email service.
              } else {
                console.log('Email data not found.');
              }
            })
            .catch((error) => {
              console.error('Error fetching email data:', error);
            });
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
            <div className='btnContainer'>
              <div className="buttonContainer">
                <button className="removeBtn" onClick={handleDelPending}>Delete Order</button>
                <button className="approveBtn" onClick={handleApproval}>Approve Order</button>
              </div>
            </div>

            <img src={imageSrc} alt="bodypic" style={{ width: '22%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
            <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
          </div>
        )}
      </div>
    );
  }
  
  export default ReviewAllOrders;