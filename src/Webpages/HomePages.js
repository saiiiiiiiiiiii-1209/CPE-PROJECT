import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import doctorImg from "../Images.js/doctor.png";
import hospitalImg from "../Images.js/hospital.png";
import Carousel from "react-bootstrap/Carousel";

function HomePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const aboutRef = useRef(null);

  const openLoginPopup = (userRole) => {
    setRole(userRole);
    setShowPopup(true);
    setShowSignupPopup(false);
  };

  const openSignupPopup = () => {
    setShowSignupPopup(true);
    setShowPopup(false);
  };

  const closePopup = () => setShowPopup(false);
  const closeSignupPopup = () => setShowSignupPopup(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "Receptionist") {
      navigate("/receptionist-dashboard");
    } else if (role === "Doctor") {
      navigate("/doctor-dashboard");
    }
    closePopup();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // After successful signup, redirect to login
    closeSignupPopup();
    setShowPopup(true);
  };

  const scrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container-fluid">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo">🏥 Advance Hospital</div>
        <nav>
          <a href="#">Home</a>
          <a onClick={scrollToAbout} style={{ cursor: "pointer" }}>
            About Us
          </a>
          <button
            className="login-btn"
            onClick={() => openLoginPopup("Receptionist")}
          >
            Receptionist Login
          </button>
          <button
            className="login-btn doctor"
            onClick={() => openLoginPopup("Doctor")}
          >
            Doctor Login
          </button>
        </nav>
      </header>

      {/* ===== HERO + CAROUSEL ===== */}
      <section className="hero-carousel">
        <div className="hero left">
          <h1>Advance Hospital Management System</h1>
          <p>
            A secure, digital platform for managing doctor appointments,
            patient records, and hospital operations efficiently.
          </p>
          <button className="learn-btn" onClick={scrollToAbout}>
            Learn More
          </button>
        </div>

        <div className="carousel right">
          <Carousel fade controls indicators>
            <Carousel.Item>
              <img
                src={hospitalImg}
                alt="Hospital"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h3>Advance Hospital</h3>
                <p>State-of-the-art healthcare facility</p>
              </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
              <img
                src={doctorImg}
                alt="Doctor"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h3>Expert Doctors</h3>
                <p>Highly qualified medical professionals</p>
              </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
              <img
                src={hospitalImg}
                alt="Hospital"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h3>Quality Care</h3>
                <p>Committed to your health and wellbeing</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="about" ref={aboutRef}>
        <h2>About Advance Hospital</h2>
        <p>
          Advance Hospital is a modern healthcare institution committed to
          delivering high-quality medical services supported by advanced
          technology.
        </p>

        <ul>
          <li>Online appointment booking</li>
          <li>Doctor & receptionist login</li>
          <li>Secure patient data management</li>
          <li>Reduced waiting time</li>
          <li>Improved hospital productivity</li>
        </ul>
      </section>

      {/* ===== LOGIN POPUP ===== */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{role} Login</h2>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />

            <div className="popup-actions">
              <button className="login" onClick={handleLogin}>
                Login
              </button>
              <button className="cancel" onClick={closePopup}>
                Cancel
              </button>
            </div>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
              Don't have an account?{" "}
              <span
                style={{ color: "#0077b6", cursor: "pointer", fontWeight: "600" }}
                onClick={openSignupPopup}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ===== SIGNUP POPUP ===== */}
      {showSignupPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Create Account</h2>
            <form onSubmit={handleSignup}>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="text" placeholder="Username" required />
              <input type="text" placeholder="Mobile Number" required />
              <input type="password" placeholder="Password" required minLength="6" />
              <input type="password" placeholder="Confirm Password" required />
              
              <div className="popup-actions">
                <button type="submit" className="login">
                  Sign Up
                </button>
                <button type="button" className="cancel" onClick={closeSignupPopup}>
                  Cancel
                </button>
              </div>
            </form>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
              Already have an account?{" "}
              <span
                style={{ color: "#0077b6", cursor: "pointer", fontWeight: "600" }}
                onClick={() => openLoginPopup(role)}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div>
          <h4>Advance Hospital</h4>
          <p>Nashik, Maharashtra</p>
          <p>Email: support@advancehospital.com</p>
        </div>

        <div>
          <h4>Terms & Conditions</h4>
          <p>Privacy Policy</p>
          <p>User Agreement</p>
        </div>

        <div>
          <h4>Hospital Location</h4>
          <iframe
            title="hospital-map"
            src="https://www.google.com/maps?q=nashik&output=embed"
          ></iframe>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

