import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from './firebase';
import allevamedicallogo from './allevamedicallogo.png';
import './UserSignUp.css'
import { ref, set, get } from "firebase/database";

function writeUserData(userId, CompanyName, name, email, mobile, role){
  const reference = ref(database, 'company/' + CompanyName + userId);

  set(reference,{
    name: name,
    username: email,
    mobile: mobile,
    company: CompanyName,
    role: role
  });
}

function UserSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Add state for first name
  const [CompanyName, setCompany] = useState(''); // Add state for company
  const [mobile, setMobile] = useState(''); // Add state for mobile phone number

  const navigate = useNavigate();

  const handleSignUp = (event) => {
    event.preventDefault();

    // Check if the company already exists in the database
    const companyRef = ref(database, 'company/'+CompanyName);


    get(companyRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Company exists, create the user under the existing company
          auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              console.log('Sign up success:', user);

              const userData = {
                firstName: firstName,
                email: email,
                mobile: mobile,
                CompanyName: CompanyName,
                role: 'client'
              };

              writeUserData(user.uid, userData.CompanyName, userData.firstName, userData.email, userData.mobile, userData.role);

              navigate('/HomePage');
            })
            .catch((error) => {
              console.log('Sign up error:', error);
            });
        } else {
          // Company doesn't exist, create a new company node and user
          const newCompanyData = {
            name: CompanyName
          };

          set(companyRef, newCompanyData)
            .then(() => {
              auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                  const user = userCredential.user;
                  console.log('Sign up success:', user);

                  const userData = {
                    firstName: firstName,
                    email: email,
                    mobile: mobile,
                    CompanyName: CompanyName,
                    role: 'client'
                  };

                  writeUserData(user.uid, userData.CompanyName, userData.firstName, userData.email, userData.mobile, userData.role);

                  navigate('/HomePage');
                })
                .catch((error) => {
                  console.log('Sign up error:', error);
                });
            })
            .catch((error) => {
              console.log('Error creating company:', error);
            });
        }
      })
      .catch((error) => {
        console.log('Error checking company:', error);
      });
  };

  const handleBackToSignIn = () => {
    // Redirect to the sign-in page (you can change '/signin' to the desired path)
    navigate('/');
  };

  return (
    <div className="SignUp-container">
        <header className = "SignUp-header">
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
          
        </header>
        <div className="SignUp-box">
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="First Name and Last Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Company"
            value={CompanyName}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            type="text"
            placeholder="Username (email address)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Mobile Phone Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        
        <button className ="signupbtn"onClick={handleSignUp}>Sign Up</button>
          
            
        <button className="back-to-signin-btn" onClick={handleBackToSignIn}>Back to Sign In</button>
          
        </div>
      </div>
  );
}

export default UserSignUp;
