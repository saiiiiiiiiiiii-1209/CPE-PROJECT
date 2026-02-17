import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../context/AppointmentsContext";
import AppointmentForm from "./AppointmentForm";  

function Appointment() {
  const navigate = useNavigate();
  const { appointments, updateAppointment, deleteAppointment } =
    useAppointments();
    
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [localAppointments, setLocalAppointments] = useState([]);
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);

  const cardiologySymptoms = [
    "Chest Pain", "Shortness of Breath", "Palpitations", 
    "High Blood Pressure", "Dizziness", "Fatigue", 
    "Swelling in Legs", "Irregular Heartbeat",
    "Nausea", "Sweating", "Pain in Arms", "Jaw Pain",
    "Lightheadedness", "Rapid Heartbeat", "Slow Heartbeat",
    "Chest Discomfort", "Coughing", "Ankle Swelling",
    "Bluish Skin", "Fainting", "Confusion"
  ];

  // Sync local appointments with context appointments
  useEffect(() => {
    if (appointments) {
      setLocalAppointments(appointments);
    }
  }, [appointments]);

  const addAppointment = (appointment) => {
    const newAppointment = {
      id: `APT-${Date.now()}`,
      ...appointment,
      status: appointment.status || "Pending"
    };
    
    // Update local state
    setLocalAppointments(prev => [...prev, newAppointment]);
    
    // Update context if it has an add function, otherwise update localStorage directly
    if (typeof updateAppointment === 'function') {
      // If your context has a separate add function, use it here
      // For now, we'll update localStorage directly
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = [...existingAppointments, newAppointment];
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }
    
    // Close the popup
    setShowPopup(false);
    
    return newAppointment;
  };

  /* =======================
     STATISTICS
  ========================*/
  useEffect(() => {
    if (!localAppointments) return;

    setStats({
      total: localAppointments.length,
      pending: localAppointments.filter((a) => a.status === "Pending").length,
      completed: localAppointments.filter((a) => a.status === "Completed").length,
      cancelled: localAppointments.filter((a) => a.status === "Cancelled").length,
    });
  }, [localAppointments]);

  /* =======================
     FILTER
  ========================*/
  const filteredAppointments = useMemo(() => {
    if (!localAppointments) return [];

    return [...localAppointments]
      .filter((apt) => {
        if (!searchTerm) return true;
        return (
          apt.patientName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          apt.phone?.includes(searchTerm)
        );
      });
  }, [localAppointments, searchTerm]);

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

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  };

  const validateEditForm = () => {
    const newErrors = {};
    const currentDateTime = getCurrentDateTime();
    
    if (!validateName(formData.patientName)) 
      newErrors.patientName = "Patient name must be 2-50 characters and contain only letters";
    
    if (!validateAge(formData.age)) 
      newErrors.age = "Age must be between 1-120 years";
    
    if (!formData.gender) 
      newErrors.gender = "Please select gender";
    
    if (!validatePhone(formData.phone)) 
      newErrors.phone = "Enter valid 10-digit number starting with 7,8,9";
    
    if (!formData.date) 
      newErrors.date = "Please select appointment date";
    else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today)
        newErrors.date = "Appointment date cannot be in the past";
    }
    
    if (!formData.time) 
      newErrors.time = "Please select appointment time";
    else if (formData.date === currentDateTime.date) {
      if (formData.time < currentDateTime.time)
        newErrors.time = "Appointment time cannot be in the past";
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =======================
     HANDLERS
  ========================*/
  const handleEdit = (apt) => {
    // Parse symptoms if it's a string
    let symptomsArray = apt.symptoms;
    if (typeof apt.symptoms === 'string') {
      symptomsArray = apt.symptoms.split(',').map(s => s.trim()).filter(s => s);
    } else if (!Array.isArray(apt.symptoms)) {
      symptomsArray = [];
    }
    
    setSelectedAppointment(apt);
    setFormData({ 
      ...apt, 
      symptoms: symptomsArray,
      type: apt.type || "Cardiology",
      doctor: apt.doctor || "Dr. Sharma",
      notes: apt.notes || ""
    });
    setEditErrors({});
    setSymptomsDropdownOpen(false);
    setShowEditPopup(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Phone validation - only digits
    if (name === "phone") {
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

  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...(prev.symptoms || []), symptom],
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      alert("❌ Please fix the errors before saving!");
      return;
    }
    
    // Format symptoms for storage
    const updatedData = {
      ...formData,
      symptoms: formData.symptoms?.join(", ") || ""
    };
    
    // Update local state
    setLocalAppointments(prev => 
      prev.map(apt => apt.id === selectedAppointment.id ? { ...apt, ...updatedData } : apt)
    );
    
    // Update localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = existingAppointments.map(apt => 
      apt.id === selectedAppointment.id ? { ...apt, ...updatedData } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    setShowEditPopup(false);
    alert(`✅ Appointment updated successfully!`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      // Update local state
      setLocalAppointments(prev => prev.filter(apt => apt.id !== id));
      
      // Update localStorage
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = existingAppointments.filter(apt => apt.id !== id);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }
  };

  const handleStatusChange = (id, status) => {
    // Update local state
    setLocalAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
    
    // Update localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = existingAppointments.map(apt => 
      apt.id === id ? { ...apt, status } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
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
    <div className="appointments-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>📋 Appointment Management</h1>
          <p style={{ marginLeft: "45px" }}>Total Appointments: {stats.total || 0}</p>
        </div>
        <button className="add-btn" onClick={() => setShowPopup(true)}>
          <span> + Book Appointment</span>
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary-stats">
        <div className="summary-card">
          <h4>📅 TOTAL</h4>
          <h2>{stats.total}</h2>
        </div>

        <div className="summary-card">
          <h4>⏳ PENDING</h4>
          <h2>{stats.pending}</h2>
        </div>

        <div className="summary-card">
          <h4>✔ COMPLETED</h4>
          <h2>{stats.completed}</h2>
        </div>

        <div className="summary-card">
          <h4>❌ CANCELLED</h4>
          <h2>{stats.cancelled}</h2>
        </div>
      </div><br />

      {/* SEARCH */}
      <div className="search-container-fluid">
        <input
          type="text"
          placeholder="Search by patient name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Patient</th>
              <th>Age/Gender</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt, index) => (
                <tr key={apt.id}>
                  <td>{index + 1}</td>
                  <td>{apt.patientName}</td>
                  <td>
                    {apt.age || "-"} / {apt.gender || "-"}
                  </td>
                  <td>{apt.phone}</td>
                  <td>{apt.date}</td>
                  <td>{apt.time}</td>

                  <td>
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        handleStatusChange(apt.id, e.target.value)
                      }
                      style={{
                        padding: "5px 10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        backgroundColor: 
                          apt.status === "Pending" ? "#fff3cd" :
                          apt.status === "Completed" ? "#d4edda" : "#f8d7da",
                        color: 
                          apt.status === "Pending" ? "#856404" :
                          apt.status === "Completed" ? "#155724" : "#721c24",
                        borderColor: 
                          apt.status === "Pending" ? "#ffeeba" :
                          apt.status === "Completed" ? "#c3e6cb" : "#f5c6cb"
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="action-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(apt)}
                      title="Edit Appointment"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "5px",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.background = "#e3f2fd"}
                      onMouseOut={(e) => e.target.style.background = "none"}
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(apt.id)}
                      title="Delete Appointment"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "5px",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.background = "#ffebee"}
                      onMouseOut={(e) => e.target.style.background = "none"}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                  No appointments found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT POPUP - Complete Appointment Form */}
      {showEditPopup && (
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
              width: "550px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>✏️ Edit Appointment</h2>
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
                {/* Patient Details */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Patient Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Patient Name *</label>
                      <input
                        name="patientName"
                        placeholder="Enter full name"
                        value={formData.patientName || ""}
                        onChange={handleEditChange}
                        style={{...inputStyle, ...(editErrors.patientName ? errorStyle : {})}}
                        required
                      />
                      {editErrors.patientName && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.patientName}</span>}
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Age *</label>
                      <input
                        name="age"
                        type="number"
                        placeholder="Age (1-120)"
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
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Gender *</label>
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
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Mobile Number *</label>
                      <input
                        name="phone"
                        placeholder="10-digit number"
                        value={formData.phone || ""}
                        onChange={handleEditChange}
                        maxLength="10"
                        style={{...inputStyle, ...(editErrors.phone ? errorStyle : {})}}
                        required
                      />
                      {editErrors.phone && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Symptoms (Optional)</h3>
                  <div className="symptoms-container">
                    <div 
                      className="symptoms-select-box"
                      onClick={() => setSymptomsDropdownOpen(!symptomsDropdownOpen)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div className="selected-symptoms-preview">
                        {formData.symptoms?.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {formData.symptoms.slice(0, 2).map((symptom) => (
                              <span key={symptom} style={{
                                background: "#e3f2fd",
                                padding: "4px 8px",
                                borderRadius: "16px",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                {symptom}
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSymptomChange(symptom);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    padding: "0 2px"
                                  }}
                                >×</button>
                              </span>
                            ))}
                            {formData.symptoms.length > 2 && (
                              <span style={{ color: "#666", fontSize: "12px" }}>
                                +{formData.symptoms.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#999" }}>Select symptoms</span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "#666" }}>▼</span>
                    </div>
                    
                    {symptomsDropdownOpen && (
                      <div style={{
                        marginTop: "10px",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "#fff"
                      }}>
                        {cardiologySymptoms.map((symptom) => (
                          <label key={symptom} style={{ display: "block", padding: "5px", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={formData.symptoms?.includes(symptom) || false}
                              onChange={() => handleSymptomChange(symptom)}
                              style={{ marginRight: "8px" }}
                            />
                            {symptom}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Appointment Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Date *</label>
                      <input
                        name="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={handleEditChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{...inputStyle, ...(editErrors.date ? errorStyle : {})}}
                        required
                      />
                      {editErrors.date && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.date}</span>}
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Time *</label>
                      <input
                        name="time"
                        type="time"
                        value={formData.time || ""}
                        onChange={handleEditChange}
                        style={{...inputStyle, ...(editErrors.time ? errorStyle : {})}}
                        required
                      />
                      {editErrors.time && <span style={{color: "#dc3545", fontSize: "12px", marginTop: "3px", display: "block"}}>{editErrors.time}</span>}
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Department</label>
                      <input
                        name="type"
                        value={formData.type || "Cardiology"}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Doctor</label>
                      <input
                        name="doctor"
                        value={formData.doctor || "Dr. Sharma"}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleEditChange}
                        rows="3"
                        placeholder="Additional notes..."
                        style={{...inputStyle, resize: "vertical"}}
                      />
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

      {/* APPOINTMENT FORM POPUP */}
      {showPopup && (
        <AppointmentForm
          onClose={() => setShowPopup(false)}
          addAppointment={addAppointment}
          appointments={localAppointments}
        />
      )}
    </div>
  );
}

export default Appointment;