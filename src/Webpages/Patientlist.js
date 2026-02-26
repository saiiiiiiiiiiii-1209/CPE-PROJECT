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
  const [loading, setLoading] = useState(true);

  // Fetch patients from backend
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/patients');
      const data = await response.json();
      if (data.success) {
        setPatients(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/patients/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, []);

  /* =======================
     IMPROVED FILTER - SEARCH IN ALL FIELDS
  ========================*/
  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    if (!searchTerm.trim()) return patients;

    const searchLower = searchTerm.toLowerCase().trim();

    return patients.filter((patient) => {
      const matches = (field) => {
        if (field === undefined || field === null) return false;
        return String(field).toLowerCase().includes(searchLower);
      };

      const symptomsMatch = patient.symptoms && 
        (Array.isArray(patient.symptoms) 
          ? patient.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower))
          : String(patient.symptoms).toLowerCase().includes(searchLower));

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
    
    if (name === "phone" || name === "alternatePhone" || name === "kinContact") {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
    } 
    else if (name === "age") {
      if (value === "" || /^\d+$/.test(value)) {
        const ageNum = parseInt(value);
        if (value === "" || (ageNum >= 0 && ageNum <= 120)) {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      }
    } 
    else if (name === "patientName") {
      if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      alert("❌ Please fix the errors before saving!");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8001/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchPatients();
        await fetchStats();
        setShowEditPopup(false);
        setEditErrors({});
        alert(`✅ Patient ${formData.patientName} updated successfully!`);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`http://localhost:8001/api/patients/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          await fetchPatients();
          await fetchStats();
          alert('✅ Patient deleted successfully!');
        } else {
          alert(`❌ Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const handleAddPatient = (patientData) => {
    setPatients(prev => [...prev, patientData]);
    setShowRegistrationPopup(false);
    fetchStats(); // Refresh stats
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
        <p>Loading patients...</p>
      </div>
    );
  }

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
                  {searchTerm ? `No patients found matching "${searchTerm}"` : "No patients found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW POPUP - Keep as is from your original code */}
      {showViewPopup && selectedPatient && (
        // ... your existing view popup code (no changes needed)
        <div>View Popup Content</div>
      )}

      {/* EDIT POPUP - Keep as is from your original code */}
      {showEditPopup && selectedPatient && (
        // ... your existing edit popup code (no changes needed)
        <div>Edit Popup Content</div>
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