import React, { useEffect, useState} from 'react';
import './HomePage.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import imageSrc from './BodyReference.jpeg';
import allevamedicallogo from './allevamedicallogo.png';

import { ref, push } from 'firebase/database';
import { auth, database } from './firebase';

function TableComponent() {
  const [nurseName, setNurseName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [compName, setCompName] = useState('');
  const [orderNum, setOrderNum] = useState('');

  useEffect(() => {
    $(document).ready(function() {
      $('#myTable').DataTable();
    });
  }, []);

  const [tableData, setTableData] = useState([
    { id: 1, name: 'Thigh Below Crotch Reference', userInput1: '', userInput2: ''},
    { id: 2, name: 'Mid Thigh Circumference', userInput1: '', userInput2: ''},
    { id: 3, name: 'Kneecap Circumference', userInput1: '', userInput2: ''},
    { id: 4, name: 'Mid Calf Circumference', userInput1: '', userInput2: ''},
    { id: 5, name: 'Ankle Circumference', userInput1: '', userInput2: ''},
    { id: 6, name: 'Arch (instep)', userInput1: '', userInput2: ''},
    { id: 7, name: 'Length of Foot', userInput1: '', userInput2: ''},
    { id: 8, name: 'Length of Leg from Heel to Crotch', userInput1: '', userInput2: ''},
    { id: 9, name: 'Length from Center of Kneecap to Heel', userInput1: '', userInput2: ''},
  ]);



  const handleInputChange = (e, index, field) => {
    const { value } = e.target;

    // Validate the input to block letters and empty inputs
    if (!/^\d*(\.\d+)?$/.test(value)) {
      // If the input is not a valid number, show an error message or perform any desired action.
      console.log('Invalid input. Please enter a valid number.');
      return;
    }


    const updatedData = [...tableData];
    updatedData[index][field] = e.target.value;
    setTableData(updatedData);
  };


  const handleOrderbtn = () => {
    const user = auth.currentUser;
    if (!user){
      console.log('User not authenticated');
      return;
    }
    const uniqId = `${compName}-${nurseName}-${orderDate}-${orderNum}`;
    const userId = user.uid;
    // Get a reference to the 'orders' node in the Firebase Realtime Database
    const ordersRef = ref(database, `users/${userId}/orders/${uniqId}`);

    // Prepare the data to be saved
    const ordersData = tableData.map((row) => ({
      name: row.name,
      userInput1: row.userInput1,
      userInput2: row.userInput2,
    }));

    
    // Push the data to the 'orders' node in the database
    push(ordersRef, ordersData)
      .then(() => {
        // Data saved successfully, you can perform any additional actions here
        console.log('Data saved successfully!');
        handleClearBtn(); // Call handleClearBtn to reset the table data
        setCompName(''); // Reset the input variables
        setNurseName('');
        setOrderDate('');
        setOrderNum('');

      })
      .catch((error) => {
        // Handle errors if any
        console.error('Error saving data:', error);
      });
  };

  const handleClearBtn = () => {
    // Create a new array with empty input values for each row
    const clearedData = tableData.map((row) => ({
      ...row,
      userInput1: '',
      userInput2: '',
    }));

    // Update the state with the cleared data
    setTableData(clearedData);
  };
  



  return (
    <div>
      <header className = "login-header" style={{ backgroundColor: 'lightblue' }}>
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '10px', backgroundColor: 'light grey'}}>
        <div id="tableContainer" style={{ marginTop: '200px', marginRight: '70px', paddingRight: '50px'}}>
          <div style={{ display: 'flex', marginBottom: '20px'}}>
            <div style={{ marginRight: '20px' }}>
              <label className="company">Company: </label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
              />
            </div>
            <div style={{ marginRight: '20px' }}>
              <label className="nurse">Nurse's Name:</label>
              <input
                type="text"
                value={nurseName}
                onChange={(e) => setNurseName(e.target.value)}
              />
            </div>
            <div style={{ marginRight: '20px' }}>
              <label className="date">Date:</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div> 
            <div>
              <label className="orderNum">Order #:</label>
              <input
                type="text"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
              />
            </div> 
          </div>
          
          
          
          
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Body Number</th>
                <th>Body Part</th>
                <th>Left Measurement</th>
                <th>Right Measurement</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <input
                      type="text"
                      value={row.userInput1}
                      onChange={(e) => handleInputChange(e, index, 'userInput1')}
                     
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.userInput2}
                      onChange={(e) => handleInputChange(e, index, 'userInput2')}
                    
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className ="Orderbtn"onClick={handleOrderbtn}>Place Order</button> 
          <button className ="clearbtn"onClick={handleClearBtn}>Clear</button> 


        </div>


        <div style={{ marginBottom: '250px' }}>
          <img src={imageSrc} alt="bodypic" style={{ width: '130%', height: 'auto', paddingTop: '40px', marginRight: '75px'}} />
        </div>
      </div>
    </div>
  );
}

export default TableComponent;

