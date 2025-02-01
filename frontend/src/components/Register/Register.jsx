import React, { useState } from "react";
import styles from './Register.module.css';
import img from './../../assets/images/login.png';
import { Link, useNavigate } from "react-router-dom";

const SignupPage = ({ setIsAuthenticated, setIsNewUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Add your registration logic here (e.g., API call)
    // For now, just simulate a successful registration
    setIsAuthenticated(true);
    localStorage.setItem("hasLoggedInBefore", "true"); // Mark user as returning
    navigate("/"); // Redirect to home or dashboard after registration
  };

  return (
    <div className={styles.form_container}>
      <div className={styles.form_section}>
        <h1>Sign Up</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log in here</Link>
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

export default SignupPage;