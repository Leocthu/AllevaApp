import React, { useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { database } from './firebase';
import { ref, get, remove } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './CompletedOrders.css'; // You can create a separate CSS file if needed
import imageSrc from './BodyReference.jpg';
import dicut from './dicut.jpg';

function CompletedOrders() {
    const [completedOrders, setCompletedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null); // Store selected order ID

    const fetchCompletedOrders = async () => {
        try {
            const completedOrdersRef = ref(database, 'admin/Completed Orders');
            const completedOrdersSnapshot = await get(completedOrdersRef);
            const completedOrdersData = completedOrdersSnapshot.val();

            if (completedOrdersData) {
                // Extract and sort order IDs based on dates
                const orderIds = Object.keys(completedOrdersData);
                const sortedOrderIds = orderIds.sort((a, b) => {
                    const dateA = new Date(a.split('-').slice(-3).join('-'));
                    const dateB = new Date(b.split('-').slice(-3).join('-'));
                    return dateA - dateB;
                });

                console.log(sortedOrderIds);
                setCompletedOrders(sortedOrderIds);
            } else {
                setCompletedOrders([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchCompletedOrders();
    }, []);

    const handleOrderClick = async (orderId) => {
        setSelectedOrderId(orderId);
        try {
            const orderSnapshot = await get(ref(database, `admin/Completed Orders/${orderId}/tableData`));
            const orderDetails = orderSnapshot.val();

            if (orderDetails) {
                setSelectedOrder(orderDetails);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleDelApproved = async () => {
        if (selectedOrder) {
          try {
  
            // Delete the selected order from the pending orders node
            await remove(ref(database, `admin/Completed Orders/${selectedOrderId}`));
            
            // Clear the selected order from state
            setSelectedOrder(null);
            setSelectedOrderId(null); // Clear the selected order ID
            
            // Refresh the pending orders list
            await fetchCompletedOrders();
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
                <h2>Completed Orders</h2>
                <div className="order-list">
                    {completedOrders.map((orderId, index) => (
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
                    <div className="buttonContainer">   
                        <button className="removeBtn" onClick={handleDelApproved}>Delete</button>
                    </div>
                    <img src={imageSrc} alt="bodypic" style={{ width: '55%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
                    <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
                </div>
            )}
        </div>
    );
}

export default CompletedOrders;
