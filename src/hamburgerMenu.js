// HamburgerMenu.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './hamburgerMenu.css';
import hamburger from './hamburger.svg';
import { auth, database } from './firebase';
import { ref, get } from 'firebase/database';

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const user = auth.currentUser;

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
          const roleRef = ref(database, `company/${CompanyName}/${userId}/role`);
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
            <Link to="/HomePage">Home</Link>
            {userRole === 'admin' && (
              <Link to="/orderSearch">Search Order</Link>
            )}
            {userRole === 'admin' && (
              <Link to="/ReviewAllOrders">Pending Orders</Link>
            )}
            <Link to="/">Sign Out</Link>
        </li>
      </ul>
    </div>
  );
}

export default HamburgerMenu;
