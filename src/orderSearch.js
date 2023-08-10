import { ref, get } from 'firebase/database';
import { auth, database } from './firebase';
import React, { useState} from 'react';
import 'datatables.net';
import 'datatables.net-dt';
import allevamedicallogo from './allevamedicallogo.png';
import HamburgerMenu from './hamburgerMenu';
import './orderSearch.css';
import imageSrc from './BodyReference.jpeg';
import dicut from './dicut.jpg';


function OrderSearch() {

    const [searchQuery, setSearchQuery] = useState('');
    const [searchedOrder, setSearchedOrder] = useState(null);

    const handleSearch = () => {
        const user = auth.currentUser;
        const userId = user.uid;
        try {
            if (userId && searchQuery) {
              const orderRef = ref(database, `users/${userId}/orders/${searchQuery}`);
              get(orderRef)
                .then(orderSnapshot => {
                  if (orderSnapshot.exists()) {
                    const orderData = orderSnapshot.val();
                    // Extract the data from the nested structure and convert it to an array
                    const extractedData = Object.values(orderData); // Assuming each order is an object
        
                    setSearchedOrder(extractedData);
               
                  } else {
                    console.log('Order not found');
                  }
                })
                .catch(error => {
                  console.error('Error fetching order data:', error);
                });
            } else {
              console.log('Invalid userId or searchQuery');
            }
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    };

    

    return (
        <div>
            <header className = "login-header" style={{ backgroundColor: 'lightblue' }}>
                <img src={allevamedicallogo} alt="Logo" className="logo-image" />
                <div style={{marginRight: '10px', backgroundColor: 'white', borderRadius: '10px'}}>
                    <HamburgerMenu/>
                </div>
            </header>
            <div>
                <h1>Order Search</h1>
                <input
                    type="text"
                    placeholder="Enter unique ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button onClick={handleSearch} className="searchbtn">Search</button>
                <h2>Order Details</h2>
                {searchedOrder && (
                    <div className="orderTable">
                        
                        <table>
                            <thead>
                            <tr>
                                <th>Body Number</th>
                                <th>Body Part</th>
                                <th>Left Measurement</th>
                                <th>Right Measurement</th>
                            </tr>
                            </thead>
                            <tbody>
                                {searchedOrder[0].map((row, index) => (
                                    <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{row.name}</td>
                                    <td>{row.userInput1}</td>
                                    <td>{row.userInput2}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginBottom: '250px' }}>
                            <img src={imageSrc} alt="bodypic" style={{ width: '100%', height: 'auto', paddingTop: '150px', marginRight: '75px'}} />
                        </div>
                        <div style={{ marginBottom: '250px' }}>
                            <img src={dicut} alt="dicutpic" style={{ width: '85%', height: 'auto', paddingTop: '150px', marginRight: '75px'}} />
                        </div>
                        
                    </div>
                )}
                
            </div>
            
        </div>
    );
}

export default OrderSearch;