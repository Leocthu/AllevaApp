import React from 'react';
import './App.css';
import LoginPage from './LoginPage';
import TableComponent from './HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { auth } from './firebase';
import UserSignUp from './UserSignUp';
import OrderSearch from './orderSearch';
import ReviewAllOrders from './ReviewAllOrders';



function App() {
  const handleSignUp = (email, password) => {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // User account created successfully
        const user = userCredential.user;
        console.log('Sign up success:', user);
      })
      .catch((error) => {
        // Handle sign-up errors
        console.log('Sign up error:', error);
      });
  };

  const handleSignIn = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // User successfully logged in
        const user = userCredential.user;
        console.log('Sign in success:', user);
      })
      .catch((error) => {
        // Handle login errors
        console.log('Sign in error:', error);
      });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage handleSignUp={handleSignUp} handleSignIn={handleSignIn} />} />
          <Route path="/HomePage" element={<TableComponent />} />
          <Route path="/UserSignUp" element={<UserSignUp />} />
          <Route path="/orderSearch" element={<OrderSearch />} />
          <Route path="/ReviewAllOrders" element={<ReviewAllOrders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
