import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Patientlist.css";
import PatientRegistrationForm from "./PatientRegistrationForm";

function Patientlist() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    other: 0
  });
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [patients, setPatients] = useState([]);

  // Load patients from localStorage on component mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    }
  }, []);

  // Save patients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  /* =======================
     STATISTICS - WITH GENDER COUNTS
  ========================*/
  useEffect(() => {
    if (!patients) return;

    const maleCount = patients.filter(p => p.gender?.toLowerCase() === "male").length;
    const femaleCount = patients.filter(p => p.gender?.toLowerCase() === "female").length;
    const otherCount = patients.filter(p => p.gender?.toLowerCase() === "other").length;

    setStats({
      total: patients.length,
      male: maleCount,
      female: femaleCount,
      other: otherCount
    });
  }, [patients]);

  /* =======================
     IMPROVED FILTER - SEARCH IN ALL FIELDS
  ========================*/
  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    if (!searchTerm.trim()) return patients;

    const searchLower = searchTerm.toLowerCase().trim();

    return patients.filter((patient) => {
      // Helper function to safely check if a field contains search term
      const matches = (field) => {
        if (field === undefined || field === null) return false;
        return String(field).toLowerCase().includes(searchLower);
      };

      // Check symptoms array specially
      const symptomsMatch = patient.symptoms && 
        (Array.isArray(patient.symptoms) 
          ? patient.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower))
          : String(patient.symptoms).toLowerCase().includes(searchLower));

      // Check all fields for match
      return (
        matches(patient.patientName) ||
        matches(patient.age) ||
        matches(patient.gender) ||
        matches(patient.dob) ||
        matches(patient.email) ||
        matches(patient.phone) ||
        matches(patient.alternatePhone) ||
        matches(patient.address) ||
        matches(patient.bloodGroup) ||
        matches(patient.profession) ||
        matches(patient.nameOfKin) ||
        matches(patient.kinContact) ||
        matches(patient.registeredDate) ||
        matches(patient.registeredTime) ||
        matches(patient.status) ||
        matches(patient.id) ||
        symptomsMatch
      );
    });
  }, [patients, searchTerm]);

  /* =======================
     VALIDATION FUNCTIONS
  ========================*/
  const validatePhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && ['7', '8', '9'].includes(cleaned[0]);
  };

  const validateAge = (age) => {
    if (!age && age !== 0) return false;
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum > 0 && ageNum <= 120;
  };

  const validateName = (name) => {
    if (!name) return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmed);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!validateName(formData.patientName)) 
      newErrors.patientName = "Patient name must be 2-50 characters and contain only letters";
    
    if (!validateAge(formData.age)) 
      newErrors.age = "Age must be between 1-120 years";
    
    if (!formData.gender) 
      newErrors.gender = "Please select gender";
    
    if (!validatePhone(formData.phone)) 
      newErrors.phone = "Enter valid 10-digit number starting with 7,8,9";
    
    if (formData.alternatePhone && !validatePhone(formData.alternatePhone))
      newErrors.alternatePhone = "Enter valid 10-digit number starting with 7,8,9";
    
    if (!validateEmail(formData.email)) 
      newErrors.email = "Enter valid email address";
    
    if (formData.kinContact && !validatePhone(formData.kinContact)) 
      newErrors.kinContact = "Enter valid 10-digit emergency contact number";
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =======================
     HANDLERS
  ========================*/
  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowViewPopup(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({ ...patient });
    setEditErrors({});
    setShowEditPopup(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only digits
    if (name === "phone" || name === "alternatePhone" || name === "kinContact") {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
    } 
    // Age validation - only positive numbers
    else if (name === "age") {
      if (value === "" || /^\d+$/.test(value)) {
        const ageNum = parseInt(value);
        if (value === "" || (ageNum >= 0 && ageNum <= 120)) {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      }
    } 
    // Name validation - only letters and spaces
    else if (name === "patientName") {
      if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
    // Other fields - no restriction
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      alert("❌ Please fix the errors before saving!");
      return;
    }
    
    setPatients(prev => 
      prev.map(p => p.id === selectedPatient.id ? { ...p, ...formData } : p)
    );
    
    setShowEditPopup(false);
    setEditErrors({});
    alert(`✅ Patient ${formData.patientName} updated successfully!`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddPatient = (patientData) => {
    const newPatient = {
      id: `PAT-${Date.now()}`,
      ...patientData,
      registeredDate: new Date().toISOString().split('T')[0],
      registeredTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: "Active"
    };
    
    setPatients(prev => [...prev, newPatient]);
    setShowRegistrationPopup(false);
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  };

  const errorStyle = {
    border: "1px solid #dc3545",
    backgroundColor: "#fff8f8"
  };

  return (
    <div className="patients-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>👥 Patient List</h1>
          <p style={{ marginLeft: "45px" }}>Total Patients: {stats.total || 0}</p>
        </div>
        <button className="add-btn" onClick={() => setShowRegistrationPopup(true)}>
          <span> + Register Patient</span>
        </button>
      </div>

      {/* SUMMARY STATS - WITH GENDER DISTRIBUTION */}
      <div className="summary-stats">
        <div className="summary-card" style={{ borderLeft: "4px solid #0d6efd" }}>
          <h4>👥 TOTAL PATIENTS</h4>
          <h2>{stats.total}</h2>
        </div>
        
        <div className="summary-card" style={{ borderLeft: "4px solid #0d6efd" }}>
          <h4>👨 MALE</h4>
          <h2>{stats.male}</h2>
        </div>
        
        <div className="summary-card" style={{ borderLeft: "4px solid #0d6efd" }}>
          <h4>👩 FEMALE</h4>
          <h2>{stats.female}</h2>
        </div>
        
        <div className="summary-card" style={{ borderLeft: "4px solid #0d6efd" }}>
          <h4>🧑 OTHER</h4>
          <h2>{stats.other}</h2>
        </div>
      </div><br />

      {/* SEARCH */}
      <div className="search-container-fluid">
        <input
          type="text"
          placeholder="Search by any field - name, gender, blood group, symptoms, profession..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* TABLE - First 6 Fields Only */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Age/Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Blood Group</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>#{String(patient.id).slice(-6)}</td>
                  <td>{patient.patientName}</td>
                  <td>
                    {patient.age || "-"} / {patient.gender || "-"}
                  </td>
                  <td>{patient.phone}</td>
                  <td>{patient.email}</td>
                  <td>{patient.bloodGroup || "-"}</td>

                  <td className="action-cell">
                    <button
                      className="view-btn"
                      onClick={() => handleView(patient)}
                      title="View Patient Details"
                    >
                      👁️
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(patient)}
                      title="Edit Patient"
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(patient.id)}
                      title="Delete Patient"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                  No patients found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW POPUP - Show All Fields */}
      {showViewPopup && selectedPatient && (
        <div
          className="popup-overlay"
          onClick={() => setShowViewPopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>👤 Patient Details</h2>
              <button
                onClick={() => setShowViewPopup(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Personal Information */}
              <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Personal Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><strong>Patient ID:</strong> {selectedPatient.id}</div>
                  <div><strong>Patient Name:</strong> {selectedPatient.patientName}</div>
                  <div><strong>Age:</strong> {selectedPatient.age}</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                  <div><strong>Date of Birth:</strong> {selectedPatient.dob}</div>
                  <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Contact Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                  <div><strong>Alternate Phone:</strong> {selectedPatient.alternatePhone || "-"}</div>
                  <div><strong>Email:</strong> {selectedPatient.email}</div>
                  <div><strong>Address:</strong> {selectedPatient.address || "-"}</div>
                </div>
              </div>

              {/* Medical Information */}
              <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Medical Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><strong>Profession:</strong> {selectedPatient.profession || "-"}</div>
                  <div><strong>Symptoms:</strong> {
                    selectedPatient.symptoms 
                      ? (Array.isArray(selectedPatient.symptoms) 
                          ? selectedPatient.symptoms.join(", ") 
                          : String(selectedPatient.symptoms))
                      : "-"
                  }</div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Emergency Contact</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><strong>Contact Person:</strong> {selectedPatient.nameOfKin || "-"}</div>
                  <div><strong>Contact Number:</strong> {selectedPatient.kinContact || "-"}</div>
                </div>
              </div>

              {/* Registration Info */}
              <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Registration Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><strong>Registered Date:</strong> {selectedPatient.registeredDate}</div>
                  <div><strong>Registered Time:</strong> {selectedPatient.registeredTime}</div>
                  <div><strong>Status:</strong> {selectedPatient.status || "Active"}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "25px", textAlign: "right" }}>
              <button
                onClick={() => setShowViewPopup(false)}
                style={{
                  background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                  color: "#fff",
                  padding: "10px 25px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP - Edit All Fields with Validation */}
      {showEditPopup && selectedPatient && (
        <div
          className="popup-overlay"
          onClick={() => setShowEditPopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>✏️ Edit Patient</h2>
              <button
                onClick={() => setShowEditPopup(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {/* Personal Information */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Personal Information</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <input
                        name="patientName"
                        placeholder="Patient Name *"
                        value={formData.patientName || ""}
                        onChange={handleEditChange}
                        style={{...inputStyle, ...(editErrors.patientName ? errorStyle : {})}}
                        required
                      />
                      {editErrors.patientName && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.patientName}</span>}
                    </div>
                    <div>
                      <input
                        name="age"
                        type="number"
                        placeholder="Age *"
                        value={formData.age || ""}
                        onChange={handleEditChange}
                        min="1"
                        max="120"
                        style={{...inputStyle, ...(editErrors.age ? errorStyle : {})}}
                        required
                      />
                      {editErrors.age && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.age}</span>}
                    </div>
                    <div>
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleEditChange}
                        style={{...inputStyle, ...(editErrors.gender ? errorStyle : {})}}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {editErrors.gender && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.gender}</span>}
                    </div>
                    <input
                      name="dob"
                      type="date"
                      placeholder="Date of Birth *"
                      value={formData.dob || ""}
                      onChange={handleEditChange}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Contact Information</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <input
                        name="phone"
                        placeholder="Phone *"
                        value={formData.phone || ""}
                        onChange={handleEditChange}
                        maxLength="10"
                        style={{...inputStyle, ...(editErrors.phone ? errorStyle : {})}}
                        required
                      />
                      {editErrors.phone && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.phone}</span>}
                    </div>
                    <div>
                      <input
                        name="alternatePhone"
                        placeholder="Alternate Phone"
                        value={formData.alternatePhone || ""}
                        onChange={handleEditChange}
                        maxLength="10"
                        style={{...inputStyle, ...(editErrors.alternatePhone ? errorStyle : {})}}
                      />
                      {editErrors.alternatePhone && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.alternatePhone}</span>}
                    </div>
                    <div>
                      <input
                        name="email"
                        type="email"
                        placeholder="Email *"
                        value={formData.email || ""}
                        onChange={handleEditChange}
                        style={{...inputStyle, ...(editErrors.email ? errorStyle : {})}}
                        required
                      />
                      {editErrors.email && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.email}</span>}
                    </div>
                    <input
                      name="address"
                      placeholder="Address"
                      value={formData.address || ""}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Medical Information</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ""}
                      onChange={handleEditChange}
                      style={inputStyle}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    <input
                      name="profession"
                      placeholder="Profession"
                      value={formData.profession || ""}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Emergency Contact</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      name="nameOfKin"
                      placeholder="Contact Person Name"
                      value={formData.nameOfKin || ""}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                    <div>
                      <input
                        name="kinContact"
                        placeholder="Contact Number"
                        value={formData.kinContact || ""}
                        onChange={handleEditChange}
                        maxLength="10"
                        style={{...inputStyle, ...(editErrors.kinContact ? errorStyle : {})}}
                      />
                      {editErrors.kinContact && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.kinContact}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  style={{
                    background: "linear-gradient(135deg, #6c757d, #5c636a)",
                    color: "#fff",
                    padding: "10px 25px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #28a745, #218838)",
                    color: "#fff",
                    padding: "10px 25px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION POPUP */}
      {showRegistrationPopup && (
        <PatientRegistrationForm
          onClose={() => setShowRegistrationPopup(false)}
          addPatient={handleAddPatient}
          patients={patients}
        />
      )}
    </div>
  );
}

export default Patientlist;