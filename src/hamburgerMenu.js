// HamburgerMenu.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './hamburgerMenu.css';
import hamburger from './hamburger.svg';

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-icon" onClick={toggleMenu}>
        <img src={hamburger} alt="Hamburger Icon" />
      </div>
      <ul className="menu-links">
        <li className="a">
            <Link to="/HomePage">Home</Link>
            <Link to="/orderSearch">Search Order</Link>



            <Link to="/">Sign Out</Link>
        </li>
      </ul>
    </div>
  );
}

export default HamburgerMenu;
