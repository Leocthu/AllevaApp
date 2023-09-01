import React, { useEffect, useState} from 'react';
import './HomePage.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import imageSrc from './BodyReference.jpg';
import allevamedicallogo from './allevamedicallogo.png';
import dicut from './dicut.jpg';

import { ref, push, get, set } from 'firebase/database';
import { auth, database } from './firebase';
import HamburgerMenu from './hamburgerMenu';

import AWS from 'aws-sdk';




function TableComponent() {
  const [nurseName, setNurseName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [compName, setCompName] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFindComp = () => {
    const user = auth.currentUser;
    if (!user){
      console.log('User not authenticated');
      return;
    }
    const userId = user.uid;
    const compRef = ref(database, `users/${userId}/Company`);
    get(compRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setCompName(snapshot.val());
        }
      })
      .catch((error) => {
        console.error('Error fetching company name:', error);
      });
  }



  useEffect(() => {
    $(document).ready(function() {
      $('#myTable').DataTable();
    });
    handleFindComp();
 

    const updateCurrentDate = () => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(currentDate.getDate()).padStart(2, '0');
  
      const formattedDate = `${year}-${month}-${day}`;
      setOrderDate(formattedDate);
    };

    updateCurrentDate();


  }, [handleFindComp]);

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
    const uniqId = `${compName}-${nurseName}-${orderDate}`;
    const userId = user.uid;
    let temp = 1;

   

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
                  Hello ${nurseName}, \n
                  
                  Thank you for placing your order! Your order has been confirmed and is currently pending approval. If you have any questions or need to make any changes to the order, please contact us at ###-###-####. \n
                  
                  Order Details: 
                  Order Number: ${uniqId} \n
                  
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

  


    const userRef = ref(database, 'users/' + userId);
    console.log(userRef.toString());
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const CompanyName = userData.Company; // Set CompanyName inside the scope
          if (compName !== CompanyName){
            console.error('Company Name Does Not Match');
            temp = 0;
            
          }
        } else {
          console.log('User data not found.');
        }
    });
    if (temp === 0){
      return;
    }
    // Get a reference to the 'orders' node in the Firebase Realtime Database
    const ordersRef = ref(database, `company/${compName}/${userId}/Orders/${uniqId}`);
    const adminRef = ref(database, `admin/Pending Orders/${uniqId}`);

    // Prepare the data to be saved
    const ordersData = tableData.map((row) => ({
      name: row.name,
      userInput1: row.userInput1,
      userInput2: row.userInput2,
    }));

    set(adminRef, ordersData)
      .then(() => {
        console.log('Pending Order Approval');
      })
      .catch((error) => {
        console.error('order is not pending');
      })

    
    // Push the data to the 'orders' node in the database
    push(ordersRef, ordersData)
      .then(() => {
        // Data saved successfully, you can perform any additional actions here
        console.log('Data saved successfully!');
        handleClearBtn(); // Call handleClearBtn to reset the table data
        setCompName(''); // Reset the input variables
        setNurseName('');
        setOrderDate('');

      })
      .catch((error) => {
        // Handle errors if any
        console.error('Error saving data:', error);
      });
      setShowConfirmation(false);
  };

  const handleBackBtn = () => {
    setShowConfirmation(false);
  }

  const handleConfirmBtn = () => {
    setShowConfirmation(true);
  }

  const handleClearBtn = () => {
    // Create a new array with empty input values for each row
    const clearedData = tableData.map((row) => ({
      ...row,
      userInput1: '',
      userInput2: '',
    }));
    setCompName('');
    setOrderDate('');
    setNurseName('');

    // Update the state with the cleared data
    setTableData(clearedData);
  };
  




  return (
    <div>
      
      <header className = "login-header" style={{ backgroundColor: 'lightblue' }}>
        <img src={allevamedicallogo} alt="Logo" className="logo-image" />
        <div style={{marginRight: '10px', backgroundColor: 'white', borderRadius: '10px'}}>
          <HamburgerMenu/>
        </div>
        
        
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: 'light grey'}}>
        <div id="tableContainer" style={{ marginTop: '100px', marginRight: '70px', paddingRight: '50px', paddingTop: '70px'}}>
          {showConfirmation && <h1>Confirmation Page</h1>}
          <div style={{ display: 'flex', marginBottom: '20px'}}>
          <div style={{ marginRight: '20px' }}>
              <label className="company">Company: {compName} </label>
            </div>
            <div style={{ marginRight: '20px' }}>
              <label className="nurse">Username:  </label>
              {showConfirmation ? (
                <span>{nurseName}</span> // Non-editable text when confirmed
              ) : (
                <input
                  type="text"
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                />
              )}
            </div>
            <div style={{ marginRight: '20px' }}>
              <label className="date">Date: {orderDate} </label>
            </div> 
          </div>
          
          {showConfirmation ? (
            <div>
              
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
                      <td>{row.userInput1}</td>
                      <td>{row.userInput2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
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
          )}
 
          <div className="button-container">
            <button className="clearbtn" onClick={handleClearBtn}>Clear</button>
            <button className="Confirmbtn" onClick={handleConfirmBtn}>Confirm</button>
            {showConfirmation && (
              <button className="Backbtn" onClick={handleBackBtn}>Back</button>
            )}
            {showConfirmation && (
              <button className="Orderbtn" onClick={handleOrderbtn}>Place Order</button>
            )}
          </div>
          

 
          
        </div>
        {showConfirmation ? (
          <div style={{ marginBottom: '250px' }}>
            <img src={dicut} alt="dicutpic" style={{ width: '110%', height: 'auto', paddingTop: '40px', marginRight: '75px'}} />
          </div>
        ) : (
          <div style={{ marginBottom: '250px' }}>
            <img src={imageSrc} alt="bodypic" style={{ width: '130%', height: 'auto', paddingTop: '40px', marginRight: '75px'}} />
          </div>
        )}
        
      </div>
    </div>
  );
}

export default TableComponent;

