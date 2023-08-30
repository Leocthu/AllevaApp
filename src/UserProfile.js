import React, { useState, useEffect } from 'react';
import allevamedicallogo from './allevamedicallogo.png';
import { database } from './firebase';
import { ref, get, set, remove } from 'firebase/database';
import HamburgerMenu from './hamburgerMenu';
import './ReviewAllOrders.css';
import imageSrc from './BodyReference.jpeg';
import dicut from './dicut.jpg';

function UserProfile() {
  
    return (
      <div>
        <header className="login-header" style={{ backgroundColor: 'lightblue' }}>
          <img src={allevamedicallogo} alt="Logo" className="logo-image" />
          <div style={{ marginRight: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            <HamburgerMenu />
          </div>
        </header>
       </div>
    );
}
  
export default UserProfile;