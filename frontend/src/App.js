import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContactForm from "./components/ContactForm/ContactForm";
import About from "./components/aboutUs/About";
import ContactHeader from "./components/contactHeader/ContactHeader";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./components/Register/Login";
import Register from "./components/Register/Register";
import Navigation from "./components/Navigation/Navigation";
import Home from "./components/home/Home";
import Footer from "./components/footer/Footer";
import Ingredients from "./components/ingredients/Ingredients";
import Recipe from "./components/Recipe/Recipe";
import { slides } from "./assets/slideData";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // Check if the user is new or returning when the app loads
  useEffect(() => {
    const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore");
    if (hasLoggedInBefore) {
      setIsNewUser(false); // User has logged in before
    }
  }, []);

  return (
    <Router>
      <Navigation isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className={"container"}>
        <main className={"main_container"}>
          <Routes>
            {/* Home Page - Accessible to all users */}
            <Route
              path="/"
              element={
                <>
                  <Home images={slides} />
                  <Ingredients />
                </>
              }
            />

            {/* Contact Page - Accessible to all users */}
            <Route
              path="/contactUs"
              element={
                <>
                  <ContactHeader />
                  <ContactForm />
                </>
              }
            />

            {/* Login Page */}
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} setIsNewUser={setIsNewUser} />}
            />

            {/* Register Page */}
            <Route
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} setIsNewUser={setIsNewUser} />}
            />

            {/* Protected Routes */}
            <Route
              path="/aboutUs"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isNewUser={isNewUser}>
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isNewUser={isNewUser}>
                  <Recipe />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
}

export default App;