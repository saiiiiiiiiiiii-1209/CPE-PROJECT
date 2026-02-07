import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ==================== DASHBOARD HOME PAGE ====================
// This component displays the main dashboard overview with statistics and quick actions
// It serves as the landing page when receptionist logs in

function DashboardHome() {
  // ==================== STATE ====================
  const [showPopup, setShowPopup] = useState(false); // Controls popup visibility
  const [popupType, setPopupType] = useState(""); // Stores which popup to show (appointment/patient/lab)

  // ==================== HELPER FUNCTIONS ====================
  // Open popup based on type
  const openPopup = (type) => {
    setPopupType(type);
    setShowPopup(true);
  };
  const navigate = useNavigate();

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setPopupType("");
  };

  // ==================== STATISTICS DATA ====================
  // This data represents real-time statistics for the dashboard
  const stats = [
    { label: "Total Appointments", value: 156, icon: "📅", color: "#1976d2" },
    { label: "Today's Appointments", value: 28, icon: "🗓️", color: "#388e3c" },
    { label: "Registered Patients", value: 1247, icon: "👥", color: "#f57c00" },

  ];

  // ==================== RECENT ACTIVITIES ====================
  // This shows recent activities in the hospital system
  const recentActivities = [
    { time: "10:30 AM", activity: "New appointment booked for John Doe", type: "appointment" },
    { time: "10:15 AM", activity: "Patient registered: Sarah Smith", type: "patient" },
    { time: "09:45 AM", activity: "Lab results ready for Patient #452", type: "lab" },
    { time: "09:30 AM", activity: "Dr. Johnson confirmed appointment", type: "doctor" },
  ];

  return (
    <div className="dashboard-home">
      {/* ==================== PAGE HEADER ==================== */}
      {/* Displays welcome message and date */}
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
      {/* Displays key metrics using flexbox for responsive layout */}
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
      {/* Provides quick access buttons for common tasks */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" style={{ width: '275px' }} onClick={() => openPopup("appointment")}>
            <span className="action-icon">📅</span>
            <span>Book Appointment</span>
          </button>
          <button className="action-btn" style={{ width: '275px' }} onClick={() => openPopup("patient")}>
            <span className="action-icon">➕</span>
            <span>Add New Patient</span>
          </button>
          <button className="action-btn" style={{ width: '275px' }}>
            <span className="action-icon">🏥</span>
            <span>Admit Patients</span>
          </button>


          <button className="action-btn" style={{ width: '275px' }}>
            <span className="action-icon">🏥</span>
            <span>Available Facalities</span>
          </button>

          <button className="action-btn" style={{ width: '275px' }}
            onClick={() => navigate("/receptionist-dashboard/appointments")}>
            <span className="action-icon">📋</span>
            <span>Appointment List</span>
          </button>
          <button className="action-btn" style={{ width: '275px' }}
            onClick={() => navigate("/receptionist-dashboard/Patients")}>
            <span className="action-icon">📋</span>
            <span>All Patient List</span>
          </button>
           <button className="action-btn" style={{ width: '275px' }}>
            <span className="action-icon">🏥</span>
            <span>Admitted List</span>
          </button>

          <button
            className="action-btn"
            style={{ width: "275px" }}
            onClick={() => navigate("/receptionist-dashboard/laboratory")}
          >
            <span className="action-icon">🔬</span>
            <span>Laboratory Details</span>
          </button>
        </div>
      </div>

      {/* ==================== RECENT ACTIVITIES SECTION ==================== */}
      {/* Shows recent activities in a list format */}
      <div className="recent-activities-section">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-time">{activity.time}</span>
              <span className="activity-text">{activity.activity}</span>
              <span className={`activity-type ${activity.type}`}>{activity.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== POPUP MODALS ==================== */}
      {/* Reusable popup component for various forms */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h2>
              {popupType === "appointment" && "New Appointment"}
              {popupType === "patient" && "Register New Patient"}
              {popupType === "lab" && "Laboratory Details"}
            </h2>

            {popupType === "appointment" && (
              <>
                <input type="text" placeholder="Patient Name" />
                <input type="text" placeholder="Doctor Name" />
                <input type="date" />
                <input type="time" />
                <textarea placeholder="Symptoms" rows="3"></textarea>
              </>
            )}

            {popupType === "patient" && (
              <>
                <input type="text" placeholder="Full Name" />
                <input type="number" placeholder="Age" />
                <input type="text" placeholder="Gender" />
                <input type="text" placeholder="Phone Number" />
                <input type="email" placeholder="Email Address" />
                <textarea placeholder="Address" rows="2"></textarea>
              </>
            )}

            {popupType === "lab" && (
              <>
                <input type="text" placeholder="Patient ID" />
                <input type="text" placeholder="Test Name" />
                <input type="date" />
                <input type="text" placeholder="Results" />
              </>
            )}

            <div className="popup-actions">
              <button className="confirm" onClick={closePopup}>
                {popupType === "appointment" && "Confirm Booking"}
                {popupType === "patient" && "Save Patient"}
                {popupType === "lab" && "Save Results"}
              </button>
              <button className="cancel" onClick={closePopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;

