import React, { useState } from "react";

// ==================== APPOINTMENTS PAGE ====================
// This component manages all appointment-related operations
// Receptionists can view, add, edit, and cancel appointments here

function Appointments() {
  // ==================== STATE ====================
  // Stores list of appointments
  const [appointments, setAppointments] = useState([
    // { id: 1, patient: "John Doe", doctor: "Dr. Smith", date: "2024-01-15", time: "10:00 AM", status: "Confirmed", type: "General" },
    // { id: 2, patient: "Jane Smith", doctor: "Dr. Johnson", date: "2024-01-15", time: "11:00 AM", status: "Pending", type: "Cardiology" },
    // { id: 3, patient: "Mike Brown", doctor: "Dr. Williams", date: "2024-01-16", time: "09:00 AM", status: "Confirmed", type: "Dental" },
    // { id: 4, patient: "Sarah Wilson", doctor: "Dr. Smith", date: "2024-01-16", time: "02:00 PM", status: "Cancelled", type: "General" },
  ]);

  // Controls form visibility
  const [showForm, setShowForm] = useState(false);
  // Stores form data
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    type: "General",
  });

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
    // Add new appointment to the list
    const newAppointment = {
      id: appointments.length + 1,
      ...formData,
      status: "Pending",
    };
    setAppointments([...appointments, newAppointment]);
    // Reset form
    setFormData({
      patient: "",
      doctor: "",
      date: "",
      time: "",
      type: "General",
    });
    setShowForm(false);
  };

  // Delete appointment
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.filter((apt) => apt.id !== id));
    }
  };

  return (
    <div className="appointments-page">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <h1>Appointments </h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Appointment"}
        </button>
      </div>

      <div className="summary-stats">
        <div className="summary-card">
          <h4>Total Appointments</h4>
          <p>{appointments.length}</p>
        </div>
        <div className="summary-card">
          <h4>Confirmed</h4>
          <p>{appointments.filter((a) => a.status === "Confirmed").length}</p>
        </div>
        <div className="summary-card">
          <h4>Pending</h4>
          <p>{appointments.filter((a) => a.status === "Pending").length}</p>
        </div>
        <div className="summary-card">
          <h4>Cancelled</h4>
          <p>{appointments.filter((a) => a.status === "Cancelled").length}</p>
        </div>
      </div><br></br>
      {/* ==================== NEW APPOINTMENT FORM ==================== */}
      {/* Hidden by default, shown when "+ New Appointment" is clicked */}
      {showForm && (
        <div className="form-container">
          <h3>Schedule New Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="patient"
                placeholder="Patient Name"
                value={formData.patient}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="doctor"
                placeholder="Doctor Name"
                value={formData.doctor}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="General">General Checkup</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dental">Dental</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
              <button type="submit" className="submit-btn">
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== APPOINTMENTS TABLE ==================== */}
      {/* Displays all appointments in a responsive table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td>#{apt.id}</td>
                <td>{apt.patient}</td>
                <td>{apt.doctor}</td>
                <td>{apt.date}</td>
                <td>{apt.time}</td>
                <td>{apt.type}</td>
                <td>
                  <span className={`status-badge ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(apt.id)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== SUMMARY STATISTICS ==================== */}
      {/* Shows quick statistics about appointments */}
      
    </div>
  );
}

export default Appointments;

