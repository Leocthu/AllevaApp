import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from './firebase';
import allevamedicallogo from './allevamedicallogo.png';
import './UserSignUp.css';
import { ref, set, get } from 'firebase/database';


function writeUserData(userId, companyName, chainName, name, email, mobile, role) {
  
  // Write user data to the new chain
  const userReference = ref(database, `company/${companyName}/chains/${chainName}/${userId}`);
  
  set(userReference, {
    name: name,
    username: email,
    mobile: mobile,
    company: companyName,
    chain: chainName,
    role: role,
  }).then(() => {
    console.log('User data written successfully to the new chain.');
  }).catch((error) => {
    console.error('Error writing user data:', error);
  });
}


function UserSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyList, setCompanyList] = useState([]);
  const [chainList, setChainList] = useState([]);
  const [showAddChainInput, setShowAddChainInput] = useState(false); // State to control the input box visibility
  const [showAddCompanyInput, setShowAddCompanyInput] = useState(false); // State to control the company input box visibility

  const navigate = useNavigate();

  useEffect(() => {
    const companyRef = ref(database, 'company');
    get(companyRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const companies = [];
          snapshot.forEach((childSnapshot) => {
            companies.push(childSnapshot.key);
          });
          setCompanyList(companies);
        }
      })
      .catch((error) => {
        console.log('Error fetching companies:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const chainRef = ref(database, `company/${selectedCompany}/chains`);
      get(chainRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const chains = [];
            snapshot.forEach((childSnapshot) => {
              chains.push(childSnapshot.key);
            });
            setChainList(chains);
          }
        })
        .catch((error) => {
          console.log('Error fetching chains:', error);
        });
    }
  }, [selectedCompany]);

  const handleSignUp = (event) => {
    event.preventDefault();

    if (showAddChainInput && selectedChain.trim() !== '') {
      const chainName = selectedChain.trim();
      if (!chainList.includes(chainName)) {
        const chainRef = ref(database, `company/${selectedCompany}/chains/${chainName}`);
        set(chainRef, {
        })
        .then(() => {
          console.log('New chain added successfully.');
          setChainList([...chainList, chainName]);
        })
        .catch((error) => {
          console.error('Error adding new chain:', error);
        });
      } else {
        console.log('Chain already exists:', chainName);
      }
    }
    

    const companyRef = ref(database, 'company/' + selectedCompany);

    get(companyRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              console.log('Sign up success:', user);

              const chainName = showAddChainInput ? selectedChain.trim() : selectedChain;


              writeUserData(user.uid, selectedCompany, chainName, firstName, email, mobile, 'client');

              navigate('/HomePage');
            })
            .catch((error) => {
              console.log('Sign up error:', error);
            });
        } else {
          console.log('Company does not exist:', selectedCompany);
        }
      })
      .catch((error) => {
        console.log('Error checking company:', error);
      });
  };

  const handleBackToSignIn = () => {
    navigate('/');
  };

  const handleAddNewChain = () => {
    setShowAddChainInput(true);
  };

  const handleAddNewCompany = () => {
    setShowAddCompanyInput(true);
  };

  return (
    <div className="SignUp-container">
      <header className="SignUp-header">
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
        <select
          value={showAddCompanyInput ? '__add__' : selectedCompany}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__add__') {
              handleAddNewCompany();
            } else {
              setSelectedCompany(value);
            }
          }}
          className="company-dropdown"
          style={{ display: showAddCompanyInput ? 'none' : 'block' }}
        >
          <option value="">Select Company</option>
          {companyList.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
          <option value="__add__">Add New Company</option>
        </select>
        {showAddCompanyInput && (
          <input
            type="text"
            placeholder="Enter New Company Name"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          />
        )}
        <select
          value={showAddChainInput ? '__add__' : selectedChain}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__add__') {
              handleAddNewChain();
            } else {
              setSelectedChain(value);
            }
          }}
          className="company-dropdown"
          style={{ display: showAddChainInput ? 'none' : 'block' }}
        >
          <option value="">Select Chain</option>
          {chainList.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
          <option value="__add__">Add New Chain</option>
        </select>
        {showAddChainInput && (
          <input
            type="text"
            placeholder="Enter New Chain Name"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          />
        )}
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
        <button className="signupbtn" onClick={handleSignUp}>
          Sign Up
        </button>
        <button className="back-to-signin-btn" onClick={handleBackToSignIn}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default UserSignUp;