// HamburgerMenu.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './hamburgerMenu.css';
import hamburger from './hamburger.svg';
import { auth, database } from './firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';


function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const user = auth.currentUser;

  const navigate = useNavigate();
  const handleSignOut = () => {
    // Sign the user out and then navigate to the sign-in page
    auth.signOut()
      .then(() => {
        console.log('User signed out successfully');
        navigate('/');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };


  useEffect(() => {
    if (!user) {
      console.log('User not authenticated');
      return; // Return early if user is not authenticated
    }

    const userId = user.uid;
    const userRef = ref(database, 'users/' + userId);

    console.log(userRef.toString());

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const CompanyName = userData.Company;
          const chainName = userData.Chain;
          const roleRef = ref(database, `company/${CompanyName}/chains/${chainName}/${userId}/role`);
          console.log(roleRef.toString());
          get(roleRef)
            .then((roleSnapshot) => {
              const role = roleSnapshot.val()
              setUserRole(role);
              console.log(role);
            })
            .catch((error) => {
              console.error('Error fetching user role:', error);
            });
        } else {
          console.log('User data not found.');
        }
      })
      .catch((error) => {
        console.error('Error retrieving user data:', error);
      });
  }, [user]);

  return (
    <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-icon" onClick={toggleMenu}>
        <img src={hamburger} alt="Hamburger Icon" />
      </div>
      <ul className="menu-links">
        <li className="a">
            <Link to="/UserProfile">Profile</Link>
            <Link to="/HomePage">Order Page</Link>
            <Link to="/orderSearch">Search Order</Link>
            {userRole === 'admin' && (
              <Link to="/ReviewAllOrders">Pending Orders</Link>
            )}
            {userRole === 'admin' && (
              <Link to="/ApprovedOrders">Approved Orders</Link>
            )}
            <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button> 
        </li>
      </ul>
    </div>
  );
}

export default HamburgerMenu;
