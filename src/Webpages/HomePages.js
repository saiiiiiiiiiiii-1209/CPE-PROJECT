import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import doctorImg from "../Images.js/doctor.png";
import hospitalImg from "../Images.js/hospital.png";
import Carousel from "react-bootstrap/Carousel";

function HomePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const aboutRef = useRef(null);

  const openLoginPopup = (userRole) => {
    setRole(userRole);
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "Receptionist") {
      navigate("/receptionist-dashboard");
    } else if (role === "Doctor") {
      navigate("/doctor-dashboard");
    }
    closePopup();
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
          <a href="/">Home</a>
          <button onClick={scrollToAbout} style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: "inherit" }}>
            About Us
          </button>
          <button
            className="login-btn"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
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
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div>
          <h4>Advance Hospital</h4>
          <p>Dhule, Maharashtra</p>
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
            src="https://www.google.com/maps/embed?pb=!4v1770462259569!6m8!1m7!1sVxVvvQZtKJZjePpUvFAzAQ!2m2!1d20.91664272034978!2d74.77042149969776!3f119.09408205301271!4f28.71417756552215!5f0.7820865974627469">
         </iframe>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
