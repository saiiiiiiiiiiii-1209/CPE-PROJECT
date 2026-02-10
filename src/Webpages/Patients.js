import React, { useState } from "react";

// ==================== PATIENTS PAGE ====================
// Enhanced patient management with all required fields
// Features: Add, View, Edit, Delete patients with popup modals

function Patients() {
  // ==================== INDIAN NAMES FOR AUTOCOMPLETE ====================
  const indianNames = [
    "Aarav Patel", "Aanya Sharma", "Aditya Kumar", "Ananya Gupta", "Arjun Singh",
    "Diya Reddy", "Ishaan Mehta", "Kavya Nair", "Lakshya Jain", "Maya Joshi",
  ];

  // ==================== CARDIOLOGY SYMPTOMS ====================
  const cardiologySymptoms = [
    "Chest Pain", "Shortness of Breath", "Palpitations", "Dizziness",
    "High Blood Pressure", "Fatigue", "Swelling in Legs", "Irregular Heartbeat",
    "Nausea", "Sweating", "Pain in Arms", "Jaw Pain", "Lightheadedness",
    "Rapid Heartbeat", "Slow Heartbeat", "Chest Discomfort", "Coughing",
    "Ankle Swelling", "Bluish Skin", "Fainting", "Confusion",
  ];

  // Dropdown state for symptoms
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);

  // Toggle symptoms dropdown
  const toggleSymptomsDropdown = () => {
    setSymptomsDropdownOpen(!symptomsDropdownOpen);
  };

  // Handle symptom checkbox change
  const handleSymptomCheckboxChange = (symptom) => {
    const currentSymptoms = formData.symptoms;
    if (Array.isArray(currentSymptoms) && currentSymptoms.includes(symptom)) {
      setFormData({
        ...formData,
        symptoms: currentSymptoms.filter(s => s !== symptom),
      });
    } else {
      setFormData({
        ...formData,
        symptoms: Array.isArray(currentSymptoms) ? [...currentSymptoms, symptom] : [symptom],
      });
    }
  };

  // ==================== STATE ====================
  // Stores list of patients with all required fields
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      patientName: "Aarav Patel", 
      age: 45, 
      gender: "Male", 
      dob: "1979-05-15",
      email: "aarav@example.com",
      phone: "9876543210",
      address: "123 Main St, City",
      symptoms: "Chest Pain, Shortness of Breath",
      bloodGroup: "O+",
      profession: "Engineer",
      nameOfKin: "Priya Patel",
      kinContact: "9876543211",
      type: "Cardiology",
      registeredDate: "2024-01-10",
      registeredTime: "10:30 AM"
    },
    { 
      id: 2, 
      patientName: "Aanya Sharma", 
      age: 32, 
      gender: "Female", 
      dob: "1992-08-22",
      email: "aanya@example.com",
      phone: "9876543212",
      address: "456 Oak Ave, Town",
      symptoms: "Palpitations, Dizziness",
      bloodGroup: "A+",
      profession: "Teacher",
      nameOfKin: "Rahul Sharma",
      kinContact: "9876543213",
      type: "Cardiology",
      registeredDate: "2024-01-12",
      registeredTime: "02:00 PM"
    },
    { 
      id: 3, 
      patientName: "Arjun Singh", 
      age: 28, 
      gender: "Male", 
      dob: "1996-03-10",
      email: "arjun@example.com",
      phone: "9876543214",
      address: "789 Pine Rd, Village",
      symptoms: "High Blood Pressure, Headache",
      bloodGroup: "B+",
      profession: "Developer",
      nameOfKin: "Neha Singh",
      kinContact: "9876543215",
      type: "Cardiology",
      registeredDate: "2024-01-14",
      registeredTime: "11:00 AM"
    },
  ]);

  // Controls form/modal visibility
  const [showForm, setShowForm] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  
  // Stores selected patient for view/edit
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Stores form data
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
    type: "Cardiology",
    registeredDate: "",
    registeredTime: "",
  });
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Get current date and time for new patient registration
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // ==================== HANDLER FUNCTIONS ====================
  // Handle input changes in form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open add patient form with fresh data
  const handleAddFormOpen = () => {
    const { date, time } = getCurrentDateTime();
    setFormData({
      ...formData,
      registeredDate: date,
      registeredTime: time,
    });
    setShowForm(true);
  };

  // Handle form submission (Add new patient)
  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: patients.length + 1,
      ...formData,
    };
    setPatients([...patients, newPatient]);
    resetForm();
    setShowForm(false);
  };

  // Handle edit submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedPatients = patients.map((p) =>
      p.id === selectedPatient.id ? { ...selectedPatient, ...formData } : p
    );
    setPatients(updatedPatients);
    resetForm();
    setShowEditPopup(false);
    setSelectedPatient(null);
  };

  // Reset form data
  const resetForm = () => {
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
      type: "Cardiology",
      registeredDate: "",
      registeredTime: "",
    });
  };

  // Open view popup
  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowViewPopup(true);
  };

  // Open edit popup
  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      patientName: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      dob: patient.dob,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      symptoms: patient.symptoms,
      bloodGroup: patient.bloodGroup,
      profession: patient.profession,
      nameOfKin: patient.nameOfKin,
      kinContact: patient.kinContact,
      type: patient.type || "Cardiology",
      registeredDate: patient.registeredDate,
      registeredTime: patient.registeredTime,
    });
    setShowEditPopup(true);
  };

  // Delete patient
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this patient record?")) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patients-page">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <h1>Patients List</h1>
        <button className="add-btn" onClick={handleAddFormOpen}>
          + Add New Patient
        </button>
      </div>

      {/* ==================== SUMMARY STATISTICS ==================== */}
      <div className="summary-stats">
        <div className="summary-card">
          <h4>Total Patients</h4>
          <p>{patients.length}</p>
        </div>
        <div className="summary-card">
          <h4>Male</h4>
          <p>{patients.filter((p) => p.gender === "Male").length}</p>
        </div>
        <div className="summary-card">
          <h4>Female</h4>
          <p>{patients.filter((p) => p.gender === "Female").length}</p>
        </div>
        <div className="summary-card">
          <h4>New This Week</h4>
          <p>{patients.filter((p) => new Date(p.registeredDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
        </div>
      </div><br></br>

      {/* ==================== SEARCH BAR ==================== */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* ==================== NEW PATIENT FORM ==================== */}
      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup-card wide-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Register New Patient</h2>
            <form onSubmit={handleSubmit}>
              {/* Datalist for Indian names autocomplete */}
              <datalist id="indian-names">
                {indianNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              {/* Datalist for cardiology symptoms */}
              <datalist id="cardiology-symptoms">
                {cardiologySymptoms.map((symptom, index) => (
                  <option key={index} value={symptom} />
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
                      value={formData.patientName}
                      onChange={handleChange}
                      list="indian-names"
                      required
                    />
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
                    <div className="symptoms-dropdown">
                      <div 
                        className="symptoms-dropdown-header"
                        onClick={toggleSymptomsDropdown}
                      >
                        <span>
                          {Array.isArray(formData.symptoms) && formData.symptoms.length > 0 
                            ? `${formData.symptoms.length} symptom(s) selected`
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
                                checked={Array.isArray(formData.symptoms) && formData.symptoms.includes(symptom)}
                                onChange={() => handleSymptomCheckboxChange(symptom)}
                              />
                              <span>{symptom}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
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
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="Cardiology">Cardiology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Registered Date</label>
                    <input
                      type="text"
                      name="registeredDate"
                      value={formData.registeredDate}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="popup-actions">
                <button type="button" className="cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PATIENTS TABLE ==================== */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Type</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Registered Date</th>
              <th>Registered Time</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>#{patient.id}</td>
                <td>{patient.patientName}</td>
                <td>{patient.type || "Cardiology"}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.registeredDate}</td>
                <td>{patient.registeredTime}</td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
              <td>
                  <button 
                    className="view-btn"
                    onClick={() => handleView(patient)}
                  >
                    View
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(patient)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(patient.id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== VIEW POPUP ==================== */}
      {showViewPopup && selectedPatient && (
        <div className="popup-overlay" onClick={() => setShowViewPopup(false)}>
          <div className="popup-card view-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Patient Details</h2>
            <div className="popup-content">
              <div className="detail-row">
                <span className="detail-label">Patient Name:</span>
                <span className="detail-value">{selectedPatient.patientName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{selectedPatient.age}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedPatient.gender}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{selectedPatient.dob}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedPatient.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedPatient.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedPatient.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Symptoms:</span>
                <span className="detail-value">{selectedPatient.symptoms}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedPatient.type || "Cardiology"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blood Group:</span>
                <span className="detail-value">{selectedPatient.bloodGroup}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Profession:</span>
                <span className="detail-value">{selectedPatient.profession}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name of Kin:</span>
                <span className="detail-value">{selectedPatient.nameOfKin}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Kin Contact:</span>
                <span className="detail-value">{selectedPatient.kinContact}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered Date:</span>
                <span className="detail-value">{selectedPatient.registeredDate} at {selectedPatient.registeredTime}</span>
              </div>
            </div>
            <div className="popup-actions">
              <button className="cancel" onClick={() => setShowViewPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT POPUP ==================== */}
      {showEditPopup && selectedPatient && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Patient</h2>
            <form onSubmit={handleEditSubmit}>
              {/* Datalist for Indian names autocomplete */}
              <datalist id="indian-names-edit">
                {indianNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              {/* Datalist for cardiology symptoms */}
              <datalist id="cardiology-symptoms-edit">
                {cardiologySymptoms.map((symptom, index) => (
                  <option key={index} value={symptom} />
                ))}
              </datalist>
              <div className="form-row">
                <input
                  type="text"
                  name="patientName"
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={handleChange}
                  list="indian-names-edit"
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="date"
                  name="dob"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
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
              <div className="form-row">
                <input
                  type="text"
                  name="symptoms"
                  placeholder="Symptoms (Cardiology related)"
                  value={formData.symptoms}
                  onChange={handleChange}
                  list="cardiology-symptoms-edit"
                />
                <input
                  type="text"
                  name="profession"
                  placeholder="Profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="nameOfKin"
                  placeholder="Name of Kin"
                  value={formData.nameOfKin}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="kinContact"
                  placeholder="Kin Contact"
                  value={formData.kinContact}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="Cardiology">Cardiology</option>
                </select>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;

