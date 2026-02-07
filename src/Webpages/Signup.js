import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // Use homepage CSS for consistent styling

function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // ==================== INPUT HANDLER ====================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // STRICT MOBILE NUMBER HANDLING
    if (name === "mobileNumber") {
      let numericValue = value.replace(/\D/g, "");

      // Block if first digit is not 7, 8, or 9
      if (numericValue.length > 0 && !/^[789]/.test(numericValue)) {
        return;
      }

      // Limit to 10 digits
      if (numericValue.length > 10) return;

      setFormData({ ...formData, mobileNumber: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ==================== FORM VALIDATION ====================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    } else if (!/^[789]/.test(formData.mobileNumber)) {
      newErrors.mobileNumber =
        "Mobile number must start with 7, 8, or 9";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Signup Data:", formData);
      navigate("/");
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="container-fluid">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo">🏥 Advance Hospital</div>
        <nav>
          <a href="#" onClick={() => navigate("/")}>Home</a>
          <button
            className="login-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </nav>
      </header>

      {/* ===== SIGNUP FORM ===== */}
      <div className="signup-container">
        <div className="form-container">
          <h3>Create Account</h3>

          <form onSubmit={handleSubmit}>
            {/* FULL NAME + EMAIL */}
            <div className="form-row">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className="error">{errors.fullName}</span>}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            {/* USERNAME + MOBILE */}
            <div className="form-row">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <span className="error">{errors.username}</span>}

              <input
                type="text"
                name="mobileNumber"
                placeholder="Mobile Number (Starts with 7, 8 or 9)"
                value={formData.mobileNumber}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
              />
              {errors.mobileNumber && (
                <span className="error">{errors.mobileNumber}</span>
              )}
            </div>

            {/* PASSWORDS */}
            <div className="form-row">
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="error">{errors.password}</span>}

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="popup-actions">
              <button type="submit" className="confirm">
                Sign Up
              </button>
              <button
                type="button"
                className="cancel"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
