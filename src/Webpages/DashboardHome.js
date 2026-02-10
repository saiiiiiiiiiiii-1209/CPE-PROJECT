
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../context/AppointmentsContext";

// ==================== DASHBOARD HOME PAGE ====================
// This component displays the main dashboard overview with statistics and quick actions
// It serves as the landing page when receptionist logs in

function DashboardHome() {
  // ==================== STATE ====================
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  // Indian names for autocomplete suggestions
  const indianNames = [
    "Aarav Patel admit form field ",
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current date and time for new patient registration
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    dob: "",
    email: "",
    phone: "",
    address: "",
    symptoms: "",
    bloodGroup: "A+",
    profession: "",
    nameOfKin: "",
    kinContact: "",
    doctor: "",
    date: "",
    time: "",
    type: "Cardiology",
    status: "Pending",
    registeredDate: "",
    registeredTime: "",
  });

  // ==================== AVAILABLE BED NUMBERS ====================
  const availableBeds = [
    "101", "102", "103", "104", "105",
    "201", "202", "203", "204", "205",
    "301", "302", "303", "304", "305",
    "ICU-1", "ICU-2", "ICU-3", "ICU-4", "ICU-5",
  ];

  // Admit patient form state
  const [admitFormData, setAdmitFormData] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    address: "",
    phone: "",
    nameOfKin: "",
    bedNo: "",
    fromDate: "",
    toDate: "",
  });

  // Get appointments context
  const { appointments, addAppointment } = useAppointments();
  const navigate = useNavigate();

  // Cardiology symptoms for checkboxes
  const cardiologySymptoms = [
    "Chest Pain",
    "Shortness of Breath",
    "Palpitations",
    "High Blood Pressure",
    "Dizziness",
    "Fatigue",
    "Swelling in Legs",
    "Irregular Heartbeat"
  ];

  // Appointment form state with symptoms array
  const [appointmentFormData, setAppointmentFormData] = useState({
    patientName: "",
    symptoms: [],
    date: "",
    time: "",
    status: "Pending",
    type: "Cardiology",
  });

  // Handle appointment symptom checkbox change
  const handleAppointmentSymptomChange = (symptom) => {
    const currentSymptoms = appointmentFormData.symptoms;
    if (currentSymptoms.includes(symptom)) {
      setAppointmentFormData({
        ...appointmentFormData,
        symptoms: currentSymptoms.filter(s => s !== symptom),
      });
    } else {
      setAppointmentFormData({
        ...appointmentFormData,
        symptoms: [...currentSymptoms, symptom],
      });
    }
  };

  // Dropdown state for symptoms
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);

  // Toggle symptoms dropdown
  const toggleSymptomsDropdown = () => {
    setSymptomsDropdownOpen(!symptomsDropdownOpen);
  };

  // Handle appointment form input changes
  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData({
      ...appointmentFormData,
      [name]: value,
    });
  };

  // Handle appointment booking submission
  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    const appointmentData = {
      ...appointmentFormData,
      symptoms: appointmentFormData.symptoms.join(", "),
    };
    addAppointment(appointmentData);
    setAppointmentFormData({
      patientName: "",
      symptoms: [],
      date: "",
      time: "",
      status: "Pending",
      type: "Cardiology",
    });
    closePopup();
    navigate("/receptionist-dashboard/appointments");
  };

  // ==================== HELPER FUNCTIONS ====================
  // Open popup based on type
  const openPopup = (type) => {
    setPopupType(type);
    setShowPopup(true);
    // Reset form when opening
    setFormData({
      patientName: "",
      age: "",
      gender: "Male",
      dob: "",
      email: "",
      phone: "",
      address: "",
      symptoms: "",
      bloodGroup: "A+",
      profession: "",
      nameOfKin: "",
      kinContact: "",
      doctor: "",
      date: "",
      time: "",
      type: "Cardiology",
      status: "Pending",
    });
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setPopupType("");
  };

  // Handle input changes for general forms
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==================== STATISTICS DATA ====================
  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: "📅", color: "#1976d2" },
    { label: "Today's Appointments", value: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: "🗓️", color: "#388e3c" },
    { label: "Registered Patients", value: appointments.length, icon: "👥", color: "#f57c00" },
  ];

  // ==================== RECENT ACTIVITIES ====================
  const recentActivities = appointments.slice(-4).reverse().map((apt) => ({
    time: apt.time,
    activity: `New appointment booked for ${apt.patientName}`,
    type: "appointment"
  }));

  return (
    <div className="dashboard-home">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="dashboard-header container-fluid">
        <h1> Welcome to Reception</h1>
        <p className="subtitle">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ==================== STATISTICS CARDS ==================== */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== QUICK ACTIONS SECTION ==================== */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        
        {/* First Row - Primary Actions */}
        <div className="action-buttons">
          <button className="action-btn" onClick={() => openPopup("appointment")}>
            <span className="action-icon">📅</span>
            <span>Book Appointment</span>
          </button>
          <button className="action-btn" onClick={() => openPopup("patient")}>
            <span className="action-icon">➕</span>
            <span>Add New Patient</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => openPopup("admit")}
          >
            <span className="action-icon">🏥</span>
            <span>Admit Patients</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🏢</span>
            <span>Available Facilities</span>
          </button>
        </div>

        {/* Second Row - Lists and Details */}
        <div className="action-buttons">
          <button 
            className="action-btn" 
            onClick={() => navigate("/receptionist-dashboard/appointments")}
          >
            <span className="action-icon">📋</span>
            <span>Appointment List</span>
          </button>
          <button 
            className="action-btn" 
            onClick={() => navigate("/receptionist-dashboard/Patients")}
          >
            <span className="action-icon">👥</span>
            <span>All Patient List</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/admit-patients")}
          >
            <span className="action-icon">🛏️</span>
            <span>Admitted List</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/laboratory")}
          >
            <span className="action-icon">🔬</span>
            <span>Laboratory Details</span>
          </button>
        </div>
      </div>

      {/* ==================== RECENT ACTIVITIES SECTION ==================== */}
      <div className="recent-activities-section">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-time">{activity.time}</span>
                <span className="activity-text">{activity.activity}</span>
                <span className={`activity-type ${activity.type}`}>{activity.type}</span>
              </div>
            ))
          ) : (
            <>
              <div className="activity-item">
                <span className="activity-time">10:30 AM</span>
                <span className="activity-text">New appointment booked for John Doe</span>
                <span className="activity-type appointment">appointment</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">10:15 AM</span>
                <span className="activity-text">Patient registered: Sarah Smith</span>
                <span className="activity-type patient">patient</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== BOOK APPOINTMENT POPUP (Same UI as Appointments page) ==================== */}
      {showPopup && popupType === "appointment" && (
        <div className="booking-form-container" onClick={closePopup}>
          <div className="booking-form-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>Book New Appointment</h3>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <form onSubmit={handleAppointmentSubmit}>
              <datalist id="indian-names-appointment">
                {indianNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              
              <div className="form-section">
                <h4>Patient Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter full name"
                      value={appointmentFormData.patientName}
                      onChange={handleAppointmentChange}
                      list="indian-names-appointment"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Symptoms (Select all that apply)</label>
                    <div className="symptoms-dropdown">
                      <div 
                        className="symptoms-dropdown-header"
                        onClick={toggleSymptomsDropdown}
                      >
                        <span>
                          {appointmentFormData.symptoms.length > 0 
                            ? `${appointmentFormData.symptoms.length} symptom(s) selected`
                            : "Select symptoms..."}
                        </span>
                        <span className={`dropdown-arrow ${symptomsDropdownOpen ? 'open' : ''}`}>▼</span>
                      </div>
                      {symptomsDropdownOpen && (
                        <div className="symptoms-dropdown-menu">
                          {cardiologySymptoms.map((symptom) => (
                            <label key={symptom} className="symptoms-checkbox-item">
                              <input
                                type="checkbox"
                                checked={appointmentFormData.symptoms.includes(symptom)}
                                onChange={() => handleAppointmentSymptomChange(symptom)}
                              />
                              <span>{symptom}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                      min={getMinDate()}
                      value={appointmentFormData.date}
                      onChange={handleAppointmentChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={appointmentFormData.time}
                      onChange={handleAppointmentChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Type</label>
                    <select name="type" value={appointmentFormData.type} onChange={handleAppointmentChange}>
                      <option value="Cardiology">Cardiology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={appointmentFormData.status} onChange={handleAppointmentChange}>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closePopup}>
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD PATIENT POPUP ==================== */}
      {showPopup && popupType === "patient" && (
        <div className="booking-form-container" onClick={closePopup}>
          <div className="booking-form-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>Register New Patient</h3>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <form>
              <div className="form-section">
                <h4>Patient Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter full name"
                      value={formData.patientName}
                      onChange={handleChange}
                      list="indian-names"
                      required
                    />
                    <datalist id="indian-names">
                      {indianNames.map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Enter age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
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
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Symptoms</label>
                    <input
                      type="text"
                      name="symptoms"
                      placeholder="Describe symptoms"
                      value={formData.symptoms}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profession</label>
                    <input
                      type="text"
                      name="profession"
                      placeholder="Enter profession"
                      value={formData.profession}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name of Kin</label>
                    <input
                      type="text"
                      name="nameOfKin"
                      placeholder="Emergency contact name"
                      value={formData.nameOfKin}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kin Contact</label>
                    <input
                      type="tel"
                      name="kinContact"
                      placeholder="Emergency contact number"
                      value={formData.kinContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  
                  <div className="form-group">
                    <label>Registered Date</label>
                    <input
                      type="text"
                      name="registeredDate"
                      value={getCurrentDateTime().date}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closePopup}>
                  Cancel
                </button>
                <button type="button" className="confirm-btn">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== LABORATORY POPUP ==================== */}
      {showPopup && popupType === "lab" && (
        <div className="booking-form-container" onClick={closePopup}>
          <div className="booking-form-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>Laboratory Details</h3>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <form>
              <div className="form-section">
                <h4>Lab Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient ID *</label>
                    <input type="text" placeholder="Enter patient ID" required />
                  </div>
                  <div className="form-group">
                    <label>Test Name *</label>
                    <input type="text" placeholder="Enter test name" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Test Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>Results</label>
                    <input type="text" placeholder="Enter results" />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closePopup}>
                  Cancel
                </button>
                <button type="button" className="confirm-btn">
                  Save Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADMIT PATIENT POPUP ==================== */}
      {showPopup && popupType === "admit" && (
        <div className="booking-form-container" onClick={closePopup}>
          <div className="booking-form-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>Admit New Patient</h3>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <form>
              <datalist id="indian-names-admit">
                {indianNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              <datalist id="bed-numbers-admit">
                {availableBeds.map((bed, index) => (
                  <option key={index} value={bed} />
                ))}
              </datalist>
              
              <div className="form-section">
                <h4>Patient Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter full name"
                      value={admitFormData.patientName}
                      onChange={(e) => setAdmitFormData({...admitFormData, patientName: e.target.value})}
                      list="indian-names-admit"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Enter age"
                      value={admitFormData.age}
                      onChange={(e) => setAdmitFormData({...admitFormData, age: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender</label>
                    <select 
                      name="gender" 
                      value={admitFormData.gender} 
                      onChange={(e) => setAdmitFormData({...admitFormData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={admitFormData.address}
                      onChange={(e) => setAdmitFormData({...admitFormData, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={admitFormData.phone}
                      onChange={(e) => setAdmitFormData({...admitFormData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kin Name</label>
                    <input
                      type="text"
                      name="nameOfKin"
                      placeholder="Emergency contact name"
                      value={admitFormData.nameOfKin}
                      onChange={(e) => setAdmitFormData({...admitFormData, nameOfKin: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h4>Admission Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bed Number *</label>
                    <input
                      type="text"
                      name="bedNo"
                      placeholder="Select bed number"
                      value={admitFormData.bedNo}
                      onChange={(e) => setAdmitFormData({...admitFormData, bedNo: e.target.value})}
                      list="bed-numbers-admit"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>From Date *</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={admitFormData.fromDate}
                      onChange={(e) => setAdmitFormData({...admitFormData, fromDate: e.target.value})}
                      min={getMinDate()}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>To Date</label>
                    <input
                      type="date"
                      name="toDate"
                      value={admitFormData.toDate}
                      onChange={(e) => setAdmitFormData({...admitFormData, toDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closePopup}>
                  Cancel
                </button>
                <button type="button" className="confirm-btn">
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;

