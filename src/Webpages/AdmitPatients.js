import React, { useState } from "react";
import "./ReceptionistDashboard.css";

// ==================== ADMIT PATIENTS PAGE ====================
// Admitted patient management with all required fields
// Features: Admit, View, Edit, Delete patients with forms

function AdmitPatients() {
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

  // ==================== AVAILABLE BED NUMBERS ====================
  const availableBeds = [
    "101", "102", "103", "104", "105",
    "201", "202", "203", "204", "205",
    "301", "302", "303", "304", "305",
    "ICU-1", "ICU-2", "ICU-3", "ICU-4", "ICU-5",
  ];

  // ==================== STATE ====================
  // Stores list of admitted patients with simplified fields
  const [admittedPatients, setAdmittedPatients] = useState([
    { 
      id: 1, 
      patientName: "Aarav Patel", 
      age: 45, 
      gender: "Male", 
      address: "123 Main St, City",
      phone: "9876543210",
      nameOfKin: "Priya Patel",
      bedNo: "101",
      fromDate: "15-01-2024",
      toDate: "20-01-2024",
    },
    { 
      id: 2, 
      patientName: "Aanya Sharma", 
      age: 32, 
      gender: "Female", 
      address: "456 Oak Ave, Town",
      phone: "9876543212",
      nameOfKin: "Rahul Sharma",
      bedNo: "102",
      fromDate: "18-01-2025",
      toDate: "25-01-2025",
    },
    { 
      id: 3, 
      patientName: "Arjun Singh", 
      age: 28, 
      gender: "Male", 
      address: "789 Pine Rd, Village",
      phone: "9876543214",
      nameOfKin: "Neha Singh",
      bedNo: "ICU-1",
      fromDate: "19-01-2025",
      toDate: "22-01-2025",
    },
  ]);

  // Controls popup visibility for admit form
  const [showBookForm, setShowBookForm] = useState(false);
  
  // Controls popup visibility for view/edit
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  
  // Stores selected patient for view/edit
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Stores form data with simplified fields
  const [formData, setFormData] = useState({
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
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ==================== HANDLER FUNCTIONS ====================
  // Handle input changes in form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open admit patient form popup with fresh data
  const handleAddFormOpen = () => {
    setFormData({
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
    setShowBookForm(true);
  };

  // Handle form submission (Admit new patient) and close popup
  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: admittedPatients.length + 1,
      ...formData,
    };
    setAdmittedPatients([...admittedPatients, newPatient]);
    // Reset form after submission
    setFormData({
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
    setShowBookForm(false);
  };

  // Handle edit submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedPatients = admittedPatients.map((p) =>
      p.id === selectedPatient.id ? { ...selectedPatient, ...formData } : p
    );
    setAdmittedPatients(updatedPatients);
    setFormData({
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
    setShowEditPopup(false);
    setSelectedPatient(null);
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
      address: patient.address || "",
      phone: patient.phone,
      nameOfKin: patient.nameOfKin || "",
      bedNo: patient.bedNo,
      fromDate: patient.fromDate,
      toDate: patient.toDate || "",
    });
    setShowEditPopup(true);
  };

  // Delete patient
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this patient record?")) {
      setAdmittedPatients(admittedPatients.filter((p) => p.id !== id));
    }
  };

  // Filter patients based on search
  const filteredPatients = admittedPatients.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  // ==================== ADMIT PATIENT FORM (AS POPUP) ====================
  const AdmitPatientForm = () => (
    <div className="booking-form-container" onClick={() => setShowBookForm(false)}>
      <div className="booking-form-card form-with-spacing" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>Admit New Patient</h3>
          <button className="close-btn" onClick={() => setShowBookForm(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <datalist id="indian-names-add">
            {indianNames.map((name, index) => (
              <option key={index} value={name} />
            ))}
          </datalist>
          <datalist id="bed-numbers-add">
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
                  value={formData.patientName}
                  onChange={handleChange}
                  list="indian-names-add"
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
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
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
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  value={formData.bedNo}
                  onChange={handleChange}
                  list="bed-numbers-add"
                  required
                />
              </div>
              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
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
                  value={formData.toDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowBookForm(false)}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              Admit Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ==================== PATIENT LIST VIEW ====================
  const PatientListView = () => (
    <div className="patient-list-page">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <h1>Admitted Patients List</h1>
        <button className="add-btn" onClick={handleAddFormOpen}>
          + Admit New Patient
        </button>
      </div>

      {/* ==================== SUMMARY STATISTICS ==================== */}
      <div className="summary-stats">
        <div className="summary-card">
          <h4>Total Admitted</h4>
          <p>{admittedPatients.length}</p>
        </div>
        <div className="summary-card">
          <h4>Male</h4>
          <p>{admittedPatients.filter((p) => p.gender === "Male").length}</p>
        </div>
        <div className="summary-card">
          <h4>Female</h4>
          <p>{admittedPatients.filter((p) => p.gender === "Female").length}</p>
        </div>
        <div className="summary-card">
          <h4>New This Week</h4>
          <p>{admittedPatients.filter((p) => new Date(p.registeredDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
        </div>
      </div>

      {/* ==================== SEARCH BAR ==================== */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients by name or mobile number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* ==================== ADMITTED PATIENTS TABLE ==================== */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Mobile No</th>
              <th>Kin Name</th>
              <th>Bed No</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>#{patient.id}</td>
                <td>{patient.patientName}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.address}</td>
                <td>{patient.phone}</td>
                <td>{patient.nameOfKin}</td>
                <td>{patient.bedNo}</td>
                <td>
                  {patient.fromDate}
                  {patient.toDate && ` - ${patient.toDate}`}
                </td>
                <td>
                  <button className="view-btn" onClick={() => handleView(patient)}>View</button>
                  <button className="edit-btn" onClick={() => handleEdit(patient)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(patient.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admit-patients-page">
      <PatientListView />

      {/* ==================== ADMIT PATIENT POPUP ==================== */}
      {showBookForm && <AdmitPatientForm />}

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
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedPatient.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile Number:</span>
                <span className="detail-value">{selectedPatient.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Kin Name:</span>
                <span className="detail-value">{selectedPatient.nameOfKin}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bed Number:</span>
                <span className="detail-value">{selectedPatient.bedNo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">From Date:</span>
                <span className="detail-value">{selectedPatient.fromDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">To Date:</span>
                <span className="detail-value">{selectedPatient.toDate || "-"}</span>
              </div>
            </div>
            <div className="popup-actions">
              <button className="cancel" onClick={() => setShowViewPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT POPUP ==================== */}
      {showEditPopup && selectedPatient && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup-card wide-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Patient</h2>
            <form onSubmit={handleEditSubmit}>
              <datalist id="indian-names-edit">
                {indianNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              <datalist id="bed-numbers-edit">
                {availableBeds.map((bed, index) => (
                  <option key={index} value={bed} />
                ))}
              </datalist>
              
              <div className="form-section">
                <h4>Patient Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Name</label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter full name"
                      value={formData.patientName}
                      onChange={handleChange}
                      list="indian-names-edit"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
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
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kin Name</label>
                    <input
                      type="text"
                      name="nameOfKin"
                      placeholder="Emergency contact name"
                      value={formData.nameOfKin}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h4>Admission Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bed Number</label>
                    <input
                      type="text"
                      name="bedNo"
                      placeholder="Select bed number"
                      value={formData.bedNo}
                      onChange={handleChange}
                      list="bed-numbers-edit"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>From Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleChange}
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
                      value={formData.toDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="popup-actions">
                <button type="button" className="cancel" onClick={() => setShowEditPopup(false)}>Cancel</button>
                <button type="submit" className="confirm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdmitPatients;

