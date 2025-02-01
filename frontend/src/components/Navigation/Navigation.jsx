import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // For the account icon
import styles from "./Navigation.module.css"; // Your existing CSS

const Navigation = ({ isAuthenticated, setIsAuthenticated }) => {
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("hasLoggedInBefore");
  };

  return (
    <div className={styles.navigation}>
      {/* Logo */}
      <div className={styles.logo}>
      <Link to="/">
          <div className={styles.logo}>
            <img src="/images/LasLogo.png" alt="logo" />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <ul>
        <li><Link to="/" className={styles.this_page}>Home</Link></li>
        <li><Link to="/aboutUs" className={styles.this_page}>About Us</Link></li>
        {/* <li><Link to="/recipe" className={styles.this_page}>Recipe</Link></li> */}
        <li><Link to="/contactUs" className={styles.this_page}>Contact Us</Link></li>
      </ul>

      {/* Conditional Auth Section */}
      <div className={styles.button}>
        {isAuthenticated ? (
          <div className={styles.accountIcon}>
            <FaUserCircle 
              size={32} 
              color="#572802" 
              style={{ cursor: "pointer" }}
              onClick={handleLogout} // Or link to profile
            />
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.login}>Login</Link>
            <Link to="/register" className={styles.signup}>Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navigation;