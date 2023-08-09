import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css'; // Import your CSS styles for navigation

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navigation ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="hamburger-menu" onClick={toggleMenu}>
        {/* Your hamburger icon */}
      </div>
      <ul className="nav-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        {/* Add more navigation links as needed */}
      </ul>
    </nav>
  );
}

export default Navigation;
