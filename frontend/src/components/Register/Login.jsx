import React, { useState } from "react";
import styles from './Register.module.css';
import img from './../../assets/images/login.png';
import { Link, useNavigate } from "react-router-dom";

const LoginPage = ({ setIsAuthenticated, setIsNewUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your authentication logic here (e.g., API call)
    // For now, just simulate a successful login
    setIsAuthenticated(true);
    localStorage.setItem("hasLoggedInBefore", "true"); // Mark user as returning
    navigate("/"); // Redirect to home or dashboard after login
  };

  return (
    <div className={styles.form_container}>
      <div className={styles.form_section}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      <div className={styles.imageC}>
        <div className={styles.image}>
          <img src={img} alt="a" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;