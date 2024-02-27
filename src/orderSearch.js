import { ref, get } from 'firebase/database';
import { auth, database } from './firebase';
import React, { useState} from 'react';
import 'datatables.net';
import 'datatables.net-dt';
import allevamedicallogo from './allevamedicallogo.png';
import HamburgerMenu from './hamburgerMenu';
import './orderSearch.css';




function OrderSearch() {

    const [searchQuery, setSearchQuery] = useState('');
    const [searchedOrder, setSearchedOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSearch = async () => {
        try {
            const user = auth.currentUser;
            const userId = user.uid;
    
            if (!userId || !searchQuery) {
                console.log('Invalid userId or searchQuery');
                return;
            }
    
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);
    
            if (!snapshot.exists()) {
                console.log('User data not found.');
                return;
            }
    
            const userData = snapshot.val();
            const CompanyName = userData.Company;
            const chainName = userData.Chain;
    
            const orderRef = ref(database, `company/${CompanyName}/chains/${chainName}/${userId}/Orders/${searchQuery}/tableData`);
            console.log(orderRef.toString());
            const orderSnapshot = await get(orderRef);
    
            if (orderSnapshot.exists()) {
                setErrorMessage('');
                const tableData = orderSnapshot.val();
                const entries = Object.entries(tableData);
                setSearchedOrder(entries);
            } else {
                console.log('Table data not found');
                setErrorMessage('Table data not found. Please try again!');
            }
        } catch (error) {
            console.error('Error fetching table data:', error);
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
                                    {searchedOrder.map(([key, value], index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{value.name}</td>
                                            <td>{value.userInput1}</td>
                                            <td>{value.userInput2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default OrderSearch;