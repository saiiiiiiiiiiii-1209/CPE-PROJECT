import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import "./AppointmentForm.css";

function AppointmentForm({ onClose, addAppointment, appointments }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    phone: "",
    email: "", // Sirf email add kiya
    symptoms: [],
    date: new Date().toISOString().split("T")[0],
    time: "",
    status: "Pending",
    type: "Cardiology",
    doctor: "Dr. Pranjal Patil", // Changed to Dr. Pranjal Patil
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  };

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateDate = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateName(formData.patientName)) 
      newErrors.patientName = "Patient name must be between 2-50 characters";
    if (!validateAge(formData.age)) 
      newErrors.age = "Age must be between 1-120 years";
    if (!formData.gender) 
      newErrors.gender = "Please select gender";
    if (!validatePhone(formData.phone)) 
      newErrors.phone = "Enter valid 10-digit number starting with 7,8,9";
    if (!validateEmail(formData.email)) 
      newErrors.email = "Enter valid email address"; // Email validation
    if (!validateDate(formData.date)) 
      newErrors.date = "Appointment date cannot be in the past";
    if (!formData.time) 
      newErrors.time = "Please select appointment time";
    else if (formData.date === getCurrentDateTime().date) {
      if (formData.time < getCurrentDateTime().time)
        newErrors.time = "Appointment time cannot be in the past";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === "age") {
      if (value === "" || /^\d+$/.test(value)) {
        const ageNum = parseInt(value);
        if (value === "" || (ageNum >= 0 && ageNum <= 120))
          setFormData(prev => ({ ...prev, [name]: value }));
      }
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

  // Email sending function
  const sendEmailConfirmation = async (appointmentData, appointmentId) => {
    try {
      const serviceId = 'service_nmfirtr';
      const templateId = 'template_dprtbk4';
      const publicKey = 'IdqomYdCZMyAOoCnB';

      // Format date and time properly
      const today = new Date();
      const registrationDate = today.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const registrationTime = today.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const templateParams = {
        to_email: formData.email,
        patient_name: formData.patientName,
        registration_date: registrationDate,
        registration_time: registrationTime,
        patient_age: formData.age,
        patient_gender: formData.gender,
        patient_phone: formData.phone,
        appointment_date: formData.date,
        appointment_time: formData.time,
        doctor_name: "Dr. Pranjal Patil", // Updated doctor name
        clinic_name: 'Medi Care Hospital',
        clinic_phone: '+91 9876543210',
        clinic_email: 'appointments@medicare.com'
      };

      console.log("📧 Sending email with params:", templateParams);

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('✅ Email sent successfully:', response);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Check for duplicate appointment time
      const isDuplicate = appointments?.some(apt => 
        apt.date === formData.date && apt.time === formData.time
      );
      
      if (isDuplicate) {
        alert("❌ This time slot is already booked!");
        setIsLoading(false);
        return;
      }
      
      const appointmentId = `APT-${Date.now()}`;
      
      const appointmentData = {
        id: appointmentId,
        patientName: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email, // Email included
        symptoms: formData.symptoms.join(", "),
        date: formData.date,
        time: formData.time,
        type: "Cardiology",
        doctor: "Dr. Pranjal Patil", // Updated doctor name
        status: "Pending",
        notes: formData.notes || "",
        bookingDate: getCurrentDateTime().date,
        bookingTime: getCurrentDateTime().time,
      };

      console.log("📤 Saving appointment:", appointmentData);

      // Add to local state
      addAppointment(appointmentData);
      
      // Send email confirmation
      const emailSent = await sendEmailConfirmation(appointmentData, appointmentId);
      
      if (emailSent) {
        alert(`✅ Appointment booked successfully! Confirmation email sent to ${formData.email}`);
      } else {
        alert(`✅ Appointment booked successfully! (Email could not be sent)`);
      }
      
      // Close the popup
      onClose();
      
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Failed to book appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>📅 Book Appointment</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Patient Details</h4>
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
                  required
                  min="1"
                  max="120"
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
                  required
                  disabled={isLoading}
                  className={errors.gender ? "error" : ""}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit (starts with 7,8,9)"
                  required
                  maxLength="10"
                  disabled={isLoading}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            {/* Email Field - Added */}
            <div className="form-row">
              <div className="form-group full-width">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  required
                  disabled={isLoading}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
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

          <div className="form-section">
            <h4>Appointment Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={getMinDate()}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={errors.date ? "error" : ""}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={errors.time ? "error" : ""}
                />
                {errors.time && <span className="error-message">{errors.time}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Booking...
                </>
              ) : (
                "Confirm Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;