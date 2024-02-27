  import React, { useEffect, useState, useCallback} from 'react';
  import './HomePage.css';
  import $ from 'jquery';
  import 'datatables.net';
  import 'datatables.net-dt';
  import imageSrc from './BodyReference.jpg';
  import allevamedicallogo from './allevamedicallogo.png';
  import dicut from './dicut.jpg';
  import { Link } from 'react-router-dom';

  import { ref, get, set } from 'firebase/database';
  import { auth, database } from './firebase';
  import HamburgerMenu from './hamburgerMenu';

  import AWS from 'aws-sdk';




  function TableComponent() {
    const [nurseName, setNurseName] = useState('');
    const [orderDate, setOrderDate] = useState('');
    
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [chainName, setChainName] = useState('');
    const [compName, setCompName] = useState('');
    const [pumpSize, setPumpSize] = useState('');
    const [sleeveType, setSleeve] = useState('');

    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');
    const [inputError, setInputError] = useState('');

    const [selectedButton, setSelectedButton] = useState('');

    const handleButtonClick = (buttonName) => {
      setSelectedButton(buttonName);
      setSleeve(buttonName);
    };

    

    


    const handlePumpSizeSelection = (size) => {
      setPumpSize(size);
      setError('');
    };



    const handleFindComp = useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated');
        return;
      }
      const userId = user.uid;
      const compRef = ref(database, `users/${userId}/Company`);
      
      get(compRef)
        .then((compSnapshot) => {
          if (compSnapshot.exists()) {
            setCompName(compSnapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching company name:', error);
        });
    }, []);
    
    const handleFindChain = useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated');
        return;
      }
      const userId = user.uid;
      const chainRef = ref(database, `users/${userId}/Chain`);
      
      get(chainRef)
        .then((chainSnapshot) => {
          if (chainSnapshot.exists()) {
            setChainName(chainSnapshot.val());
          }
        })
        .catch((error) => {
          console.error('Error fetching chain name:', error);
        });
    }, []);

    useEffect(() => {
      $(document).ready(function() {
        $('#myTable').DataTable();
      });
      handleFindComp();
      handleFindChain();
  

      const updateCurrentDate = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');
    
        const formattedDate = `${year}-${month}-${day}`;
        setOrderDate(formattedDate);
      };

      updateCurrentDate();


    }, [handleFindComp, handleFindChain]);

    const [tableData, setTableData] = useState([
      { id: 1, name: 'Thigh Below Crotch Circumference', userInput1: '', userInput2: ''},
      { id: 2, name: 'Mid Thigh Circumference', userInput1: '', userInput2: ''},
      { id: 3, name: 'Kneecap Circumference', userInput1: '', userInput2: ''},
      { id: 4, name: 'Mid Calf Circumference', userInput1: '', userInput2: ''},
      { id: 5, name: 'Ankle Circumference', userInput1: '', userInput2: ''},
      { id: 6, name: 'Arch (instep)', userInput1: '', userInput2: ''},
      { id: 7, name: 'Length of Foot', userInput1: '', userInput2: ''},
      { id: 8, name: 'Length of Leg from Heel to Crotch', userInput1: '', userInput2: ''},
      { id: 9, name: 'Length from Center of Kneecap to Heel', userInput1: '', userInput2: ''},
      { id: 10, name: 'Upper Abdomen Length to Crotch', userInput1: '', userInput2: ''},
      { id: 11, name: 'Rib Circumference', userInput1: '', userInput2: ''},
      { id: 12, name:  'Belly Circumference', userInput1: '', userInput2: ''},
      { id: 13, name:  'Waist Circumference', userInput1: '', userInput2: ''},
      { id: 14, name:  'Hip Circumference', userInput1: '', userInput2: ''},

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


    const handleOrderbtn = async () => {

      await handleFindComp();
      await handleFindChain();
      const user = auth.currentUser;
      if (!user){
        console.log('User not authenticated');
        return;
      }

    
      const userId = user.uid;
      let uniqId = '';
      let orderNum = 0;

      try {
        const orderNumRef = ref(database, `company/${compName}/chains/${chainName}/orderNum`);
        const orderNumSnapshot = await get(orderNumRef); // Await the result of get()
      
        if (orderNumSnapshot.exists()) {
          orderNum = orderNumSnapshot.val() + 1; // Increment order number
        } else {
          orderNum = 1; // Initialize order number to 1 if it doesn't exist
        }
        
        uniqId = `${chainName}-${nurseName}-${orderNum}`;
        console.log("Unique ID:", uniqId);
        
        // Now you can use the uniqId as needed, such as sending it in an email or storing it in the database
      } catch (error) {
        console.error('Error getting order number:', error);
      }

      const sendOrderConfirmationEmail = (recipientEmail) => {
        const ses = new AWS.SES();
        // Logic for order confirmation email
        const emailParams = {
          Destination: {
            ToAddresses: [recipientEmail, 'allevamanufacturing.eric@gmail.com'],
          },
          Message: {
            Body: {
              Text: {
                Data: `Hello ${nurseName}, 
                  
        Thank you for placing your order! Your order has been confirmed and is currently pending approval. If you have any questions or need to make any changes to the order, please contact us at ###-###-####. \n
                  
        Order Details: 
        Order Number: ${uniqId} 
                  
        Best Regards, 
        Alleva Manufacturing
                `,
              },
            },
            Subject: {
              Data: 'Order Confirmation',
            },
          },
          Source: 'allevamanufacturing.eric@gmail.com',
        };
    
        ses.sendEmail(emailParams, (err, data) => {
          if (err) {
            console.error('Error sending order confirmation email:', err);
          } else {
            console.log('Order confirmation email sent successfully:', data);
          }
        });
      };
    

      const sendNotificationEmail = (recipientEmail) => {
        // Logic for notification email (completely separate content)
        const ses = new AWS.SES();
        const notificationEmailParams = {
          Destination: {
            ToAddresses: [recipientEmail],
          },
          Message: {
            Body: {
              Text: {
                Data: `Hello, \n
      This is a notification that ${nurseName} has placed an order. \n
      Order Details: 
      Order Number: ${uniqId}  \n
      Regards, 
      Alleva Manufacturing
                `,
              },
            },
            Subject: {
              Data: 'Order Notification',
            },
          },
          Source: 'allevamanufacturing.eric@gmail.com',
        };
    
        ses.sendEmail(notificationEmailParams, (err, data) => {
          if (err) {
            console.error('Error sending notification email:', err);
          } else {
            console.log('Notification email sent successfully:', data);
          }
        });
      };

      alert('Order placed successfully. Email confirmation sent.');
    

    

      const emailRef = ref(database, `company/${compName}/chains/${chainName}/${userId}/username`);
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
          
          sendOrderConfirmationEmail(emailValue);
          const allevaMed = 'lch001@ucsd.edu';
          sendNotificationEmail(allevaMed);


        } else {
          console.log('Email data not found.');
        }
      })
      .catch((error) => {
        console.error('Error fetching email data:', error);
      });

    
    
      let dataToSave;
      if (sleeveType === 'Leg') {
        dataToSave = tableData.slice(0, 9).map((row) => ({
          name: row.name,
          userInput1: row.userInput1,
          userInput2: row.userInput2,
        }));
      } else if (sleeveType === 'Pants') {
        dataToSave = tableData.map((row) => ({
          name: row.name,
          userInput1: row.userInput1,
          userInput2: row.userInput2,
        }));
      } else {
        // Handle the case when sleeveType is neither 'Leg' nor 'Pants'
        console.error('Invalid sleeve type:', sleeveType);
        return;
      }

      // Get a reference to the 'orders' node in the Firebase Realtime Database
      const ordersRef = ref(database, `company/${compName}/chains/${chainName}/${userId}/Orders/${uniqId}`);
      const adminRef = ref(database, `admin/Pending Orders/${uniqId}`);

      // Prepare the data to be saved 
      const ordersData = {
        pumpSize: pumpSize,
        orderDate: orderDate,
        SleeveType: sleeveType,
        tableData: dataToSave
      };

      set(adminRef, ordersData)
        .then(() => {
          console.log('Pending Order Approval');
        })
        .catch((error) => {
          console.error('order is not pending');
        })


      
      console.log("Company Name:", compName); 
      console.log("Chain Name:", chainName);

      

      const orderNumRef = ref(database, `company/${compName}/chains/${chainName}/orderNum`);
      await set(orderNumRef, orderNum); // Update order number

      
      // Push the data to the 'orders' node in the database
      set(ordersRef, ordersData)
        .then(() => {
          // Data saved successfully, you can perform any additional actions here
          console.log('Data saved successfully!');
          handleClearBtn();

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
      // Check if nurseName is empty
      if (!nurseName) {
        setNameError("Please enter your name");
        setShowConfirmation(false);
        return;
      } else {
        setNameError('');
      }
    
      // Check if pumpSize is empty
      if (!pumpSize) {
        setError("Please choose a chamber size");
        setShowConfirmation(false);
        return;
      } 
      // Check if any input fields in the table are empty
      const isAnyFieldEmpty = tableData.some(row => !row.userInput1 || !row.userInput2);
      if (isAnyFieldEmpty) {
        setInputError("Please fill in all measurement fields");
        setShowConfirmation(false);
        return;
      } else {
        setInputError('');
      }
    
      // If all validations pass, set showConfirmation to true
      setShowConfirmation(true);
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

    const renderTableRows = () => {
      if (selectedButton === 'Leg') {

        return tableData.slice(0, 9).map(renderTableRow);
      } else if (selectedButton === 'Pants') {
      
        return tableData.map(renderTableRow);
      }
    };
  
    const renderTableRow = (row, index) => (
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
    );
    




    return (
      <div>
        
        <header className = "login-header" style={{ backgroundColor: 'lightblue' }}>
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
          <div style={{marginRight: '10px', backgroundColor: 'white', borderRadius: '10px'}}>
            <HamburgerMenu/>
          </div>
          
          
        </header>
        <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'light grey'}}>
          
          <div id="tableContainer" style={{ width: '55%', marginLeft: '3%',marginRight: '0px', marginTop: '55px', paddingRight: '20px', paddingTop: '30px'}}>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1' }} onClick={() => handlePumpSizeSelection('6')}>
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: pumpSize === '6' ? 'lightblue' : 'white',
                  borderRadius: '20px',
                  border: '2px solid black',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                  
                }}
              >
                <button style={{ fontSize: '15px', border: 'none', background: 'none', cursor: 'pointer' }}>Pump Size Six</button>
              </div>
            </div>

            <div style={{ flex: '1' }} onClick={() => handlePumpSizeSelection('8')}>
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: pumpSize === '8' ? 'lightblue' : 'white',
                  borderRadius: '20px',
                  border: '2px solid black',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                }}
              >
                <button style={{ fontSize: '15px', cursor: 'pointer', border: 'none', background: 'none' }}>Pump Size Eight</button>
              </div>
            </div>
            
          </div>

          {error && <div className="error-message-pump">{error}</div>}

          <div style={{ marginBottom: '40px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1' }} onClick={() => handleButtonClick('Shoulder')}>
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedButton === 'Shoulder' ? 'lightblue' : 'white',
                  borderRadius: '20px',
                  border: '2px solid black',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                }}
              >
                <Link to="/HomePage" className="part-linkA" style={{ fontSize: '15px', textDecoration: 'none', color: 'black' }}>
                  Shoulder
                </Link>
              </div>
            </div>

            <div style={{ flex: '1' }} onClick={() => handleButtonClick('Pants')}>
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedButton === 'Pants' ? 'lightblue' : 'white',
                  borderRadius: '20px',
                  border: '2px solid black',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                }}
              >
                <Link to="/HomePage" className="part-linkB" style={{ fontSize: '15px', textDecoration: 'none', color: 'black' }}>
                  Pants
                </Link>
              </div>
            </div>

            <div style={{ flex: '1' }} onClick={() => handleButtonClick('Leg')}>
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedButton === 'Leg' ? 'lightblue' : 'white',
                  borderRadius: '20px',
                  border: '2px solid black',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                }}
              >
                <Link to="/HomePage" className="part-linkC" style={{ fontSize: '15px', textDecoration: 'none', color: 'black' }}>
                  Leg
                </Link>
              </div>
            </div>
          </div>






            {showConfirmation && <h1>Confirmation</h1>}
            <div style={{ display: 'flex', marginBottom: '20px'}}>
            <div style={{ marginRight: '20px' }}>
                <label className="company">Company: {chainName} </label>
              </div>
              <div style={{ marginRight: '20px' }}>
                <label className="nurse">Name:  </label>
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
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Body Number</th>
                    <th>Body Part</th>
                    <th>Left Measurement</th>
                    <th>Right Measurement</th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
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
                <tbody>{renderTableRows()}</tbody>
              </table>
              
            )}

            {nameError && <div className="error-message-name">{nameError}</div>}  
            {inputError && <div className="error-message-input">{inputError}</div>}

            
  
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
              <img src={dicut} alt="dicutpic" style={{ width: '55%', height: 'auto', paddingTop: '10px', marginRight: '20%'}} />
            </div>
          ) : (
            <div style={{ marginBottom: '250px' }}>
              <img src={imageSrc} alt="bodypic" style={{ width: '97%', height: 'auto', paddingTop: '40px', marginLeft: '10px'}} />
            </div>
          )}
          
        </div>
      </div>
    );
  }

  export default TableComponent;

