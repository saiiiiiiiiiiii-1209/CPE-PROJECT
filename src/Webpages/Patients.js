import React, { useState } from "react";

// ==================== PATIENTS PAGE ====================
// This component manages patient registration and records
// Receptionists can add new patients and view existing patient list

function Patients() {
  // ==================== STATE ====================
  // Stores list of patients
  const [patients, setPatients] = useState([
    // { id: 1, name: "John Doe", age: 45, gender: "Male", phone: "9876543210", email: "john@example.com", address: "123 Main St", joinDate: "2024-01-10" },
    // { id: 2, name: "Jane Smith", age: 32, gender: "Female", phone: "9876543211", email: "jane@example.com", address: "456 Oak Ave", joinDate: "2024-01-08" },
    // { id: 3, name: "Mike Brown", age: 28, gender: "Male", phone: "9876543212", email: "mike@example.com", address: "789 Pine Rd", joinDate: "2024-01-05" },
    // { id: 4, name: "Sarah Wilson", age: 55, gender: "Female", phone: "9876543213", email: "sarah@example.com", address: "321 Elm St", joinDate: "2024-01-03" },
    // { id: 5, name: "David Lee", age: 40, gender: "Male", phone: "9876543214", email: "david@example.com", address: "654 Maple Dr", joinDate: "2024-01-01" },
  ]);

  // Controls form visibility
  const [showForm, setShowForm] = useState(false);
  // Stores form data
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
  });
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // ==================== HANDLER FUNCTIONS ====================
  // Handle input changes in form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new patient to the list
    const newPatient = {
      id: patients.length + 1,
      ...formData,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setPatients([...patients, newPatient]);
    // Reset form
    setFormData({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
    });
    setShowForm(false);
  };

  // Delete patient
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patients-page">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <h1>Patients List</h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add New Patient"}
        </button>
      </div>

      {/* ==================== SUMMARY STATISTICS ==================== */}
      {/* Shows quick statistics about patients */}
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
          <p>{patients.filter((p) => new Date(p.joinDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
        </div>
      </div><br></br>

      {/* ==================== SEARCH BAR ==================== */}
      {/* Allows receptionist to search patients by name, phone, or email */}
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
      {/* Hidden by default, shown when "+ Add New Patient" is clicked */}
      {showForm && (
        <div className="form-container">
          <h3>Register New Patient</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
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
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
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
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
            <div className="form-row">
              <button type="submit" className="submit-btn">
                Save Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== PATIENTS TABLE ==================== */}
      {/* Displays all patients in a responsive table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>#{patient.id}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
                <td>{patient.joinDate}</td>
                <td>
                  <button className="view-btn">View</button>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(patient.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
    </div>
  );
}

export default Patients;

