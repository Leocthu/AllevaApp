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

  useEffect(() => {
    // Fetch user's role from the database
    const user = auth.currentUser;
    if (!user){
      console.log('User not authenticated');
      return;
    }
    const userId = user.uid; // Replace with the user's ID
    const userRef = ref(database, `users/${userId}/role`);
  
    get(userRef).then((snapshot) => {
      const role = snapshot.val() || '';
      setUserRole(role);
    }).catch((error) => {
      console.error('Error fetching user role:', error);
    });
  }, []);

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
            <Link to="/">Sign Out</Link>
        </li>
      </ul>
    </div>
  );
}

export default HamburgerMenu;
