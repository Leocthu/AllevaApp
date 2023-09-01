import { ref, get } from 'firebase/database';
import { auth, database } from './firebase';
import React, { useState} from 'react';
import 'datatables.net';
import 'datatables.net-dt';
import allevamedicallogo from './allevamedicallogo.png';
import HamburgerMenu from './hamburgerMenu';
import './orderSearch.css';
import imageSrc from './BodyReference.jpg';
import dicut from './dicut.jpg';


function OrderSearch() {

    const [searchQuery, setSearchQuery] = useState('');
    const [searchedOrder, setSearchedOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSearch = () => {

        const user = auth.currentUser;
        const userId = user.uid;
        let CompanyName = "";
        
        try {
            if (userId && searchQuery) {
              // Construct the reference to the specified user's path
              const userRef = ref(database, 'users/' + userId);
        
              // Retrieve the user's data and company name
              get(userRef)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    const userData = snapshot.val();
                    CompanyName = userData.Company; // Set CompanyName inside the scope
                  } else {
                    console.log('User data not found.');
                  }
        
                  // Continue with the rest of the logic
                  const orderRef = ref(database, `company/${CompanyName}/${userId}/Orders/${searchQuery}`);
                  console.log(orderRef.toString());
                  get(orderRef)
                    .then(orderSnapshot => {
                        if (orderSnapshot.exists()) {
                            setErrorMessage('');
                            const orderData = orderSnapshot.val();
                            // Extract the data from the nested structure and convert it to an array
                            const extractedData = Object.values(orderData); // Assuming each order is an object
                            setSearchedOrder(extractedData);
                        } else {
                            console.log('Order not found');
                            setErrorMessage('Order not found. Please try again!');
                        }
                    })
                    .catch(error => {
                      console.error('Error fetching order data:', error);
                    });
                })
                .catch((error) => {
                  console.error('Error retrieving user data:', error);
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
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {searchedOrder && (
                    <div>
                        <div className="orderTable">
                            <h2>Order Details</h2>
                            <table className="table">
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
                        </div>
                        <div>
                            <img src={imageSrc} alt="bodypic" style={{ width: '22%', height: 'auto', paddingRight: '40px', paddingLeft: '85px'}}/>
                            <img src={dicut} alt="dicutpic" style={{ width: '30%', height: 'auto', paddingLeft: '40px'}}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderSearch;