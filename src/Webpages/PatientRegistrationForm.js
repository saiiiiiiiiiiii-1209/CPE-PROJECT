import React, { useState } from "react";
import emailjs from '@emailjs/browser';
import "./PatientRegistrationForm.css";

function PatientRegistrationForm({ onClose, addPatient, patients }) {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    dob: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    symptoms: [],
    bloodGroup: "",
    profession: "",
    nameOfKin: "",
    kinContact: ""
  });
  
  const [errors, setErrors] = useState({});
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  
  const cardiologySymptoms = [
    "Chest Pain", "Shortness of Breath", "Palpitations", 
    "High Blood Pressure", "Dizziness", "Fatigue", 
    "Swelling in Legs", "Irregular Heartbeat",
    "Nausea", "Sweating", "Pain in Arms", "Jaw Pain",
    "Lightheadedness", "Rapid Heartbeat", "Slow Heartbeat",
    "Chest Discomfort", "Coughing", "Ankle Swelling",
    "Bluish Skin", "Fainting", "Confusion"
  ];

  const getMinDate = () => new Date().toISOString().split('T')[0];
  
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const validatePhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && ['7', '8', '9'].includes(cleaned[0]);
  };

  const validateAge = (age) => {
    if (!age) return false;
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum > 0 && ageNum <= 120;
  };

  const validateName = (name) => {
    if (!name) return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateName(formData.patientName)) 
      newErrors.patientName = "Patient name must be between 2-50 characters";
    if (!validateAge(formData.age)) 
      newErrors.age = "Age must be between 1-120 years";
    if (!formData.dob) 
      newErrors.dob = "Date of birth is required";
    else {
      const age = parseInt(formData.age);
      const calculatedAge = parseInt(calculateAgeFromDOB(formData.dob));
      if (age !== calculatedAge) newErrors.dob = "Age doesn't match date of birth";
    }
    if (!validatePhone(formData.phone)) 
      newErrors.phone = "Enter valid 10-digit number starting with 7,8,9";
    if (formData.alternatePhone && !validatePhone(formData.alternatePhone))
      newErrors.alternatePhone = "Enter valid 10-digit number starting with 7,8,9";
    if (!validateEmail(formData.email)) 
      newErrors.email = "Enter valid email address";
    if (!formData.bloodGroup) 
      newErrors.bloodGroup = "Please select blood group";
    if (formData.kinContact && !validatePhone(formData.kinContact)) 
      newErrors.kinContact = "Enter valid 10-digit emergency contact number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "dob") {
      const age = calculateAgeFromDOB(value);
      setFormData(prev => ({ ...prev, dob: value, age: age }));
    } else if (name === "age") {
      if (value === "" || /^\d+$/.test(value)) {
        const ageNum = parseInt(value);
        if (value === "" || (ageNum >= 0 && ageNum <= 120))
          setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (["phone", "alternatePhone", "kinContact"].includes(name)) {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const isDuplicate = patients?.some(p => 
        p.phone === formData.phone || p.email === formData.email
      );
      
      if (isDuplicate) {
        alert("❌ Patient with this phone or email already exists!");
        setIsLoading(false);
        return;
      }
      
      const patientId = `PAT-${Date.now()}`;
      const registeredDate = new Date().toISOString().split('T')[0];
      const registeredTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const patientData = {
        id: patientId,
        ...formData,
        registeredDate: registeredDate,
        registeredTime: registeredTime,
        status: "Active"
      };
      
      // Add patient to local state
      addPatient(patientData);
      
      
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Failed to register patient. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-container patient-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>➕ Register New Patient</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={isLoading}
                  className={errors.patientName ? "error" : ""}
                />
                {errors.patientName && <span className="error-message">{errors.patientName}</span>}
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age (1-120)"
                  min="1"
                  max="120"
                  required
                  disabled={isLoading}
                  className={errors.age ? "error" : ""}
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={getMinDate()}
                  required
                  disabled={isLoading}
                  className={errors.dob ? "error" : ""}
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Contact Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit (starts with 7,8,9)"
                  maxLength="10"
                  required
                  disabled={isLoading}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Alternate Phone</label>
                <input
                  style={{marginTop:"24px"}}
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  placeholder="Alternate Number"
                  maxLength="10"
                  disabled={isLoading}
                  className={errors.alternatePhone ? "error" : ""}
                />
                {errors.alternatePhone && <span className="error-message">{errors.alternatePhone}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label>Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Medical Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label style={{paddingBottom:"7px"}}>Blood Group *</label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={errors.bloodGroup ? "error" : ""}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.bloodGroup && <span className="error-message">{errors.bloodGroup}</span>}
              </div>
              <div className="form-group">
                <label style={{display:"block",paddingTop:"3px"}}>Profession</label>
                <input
                  style={{paddingTop:"13px",paddingBottom:"13px",marginTop:"6px"}}
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Enter profession"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-section">
              <h4>Symptoms (Optional)</h4>
              <div className="symptoms-container">
                <div 
                  className="symptoms-select-box"
                  onClick={() => !isLoading && setSymptomsDropdownOpen(!symptomsDropdownOpen)}
                >
                  <div className="selected-symptoms-preview">
                    {formData.symptoms.length > 0 ? (
                      <div className="selected-chips">
                        {formData.symptoms.slice(0, 2).map((symptom) => (
                          <span key={symptom} className="symptom-chip">
                            {symptom}
                            <button 
                              type="button"
                              className="chip-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSymptomChange(symptom);
                              }}
                              disabled={isLoading}
                            >×</button>
                          </span>
                        ))}
                        {formData.symptoms.length > 2 && (
                          <span className="more-count">
                            +{formData.symptoms.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="placeholder">Select symptoms</span>
                    )}
                  </div>
                  <span className={`dropdown-arrow ${symptomsDropdownOpen ? 'open' : ''}`}>▼</span>
                </div>
                
                {symptomsDropdownOpen && !isLoading && (
                  <div className="symptoms-dropdown-menu">
                    {cardiologySymptoms.map((symptom) => (
                      <label key={symptom} className="symptom-option">
                        <input
                          type="checkbox"
                          checked={formData.symptoms.includes(symptom)}
                          onChange={() => handleSymptomChange(symptom)}
                        />
                        <span className="checkbox-label">{symptom}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Person Name</label>
                <input
                  type="text"
                  name="nameOfKin"
                  value={formData.nameOfKin}
                  onChange={handleChange}
                  placeholder="Emergency contact name"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="kinContact"
                  value={formData.kinContact}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength="10"
                  disabled={isLoading}
                  className={errors.kinContact ? "error" : ""}
                />
                {errors.kinContact && <span className="error-message">{errors.kinContact}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                "Register Patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistrationForm;