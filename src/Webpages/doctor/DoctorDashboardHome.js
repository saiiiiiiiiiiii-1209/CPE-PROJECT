import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../DashboardHome.css";

// ==================== DOCTOR DASHBOARD HOME ====================
// Uses the EXACT SAME CSS as Webpages/DashboardHome.css
// Same class names: dashboard-home, dashboard-header, stats-grid, stat-card,
// quick-actions-section, action-buttons, action-btn, recent-activities-section, etc.

function DoctorDashboardHome() {
    const navigate = useNavigate();

    // ==================== STATES ====================
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [admissions, setAdmissions] = useState([]);

    // ==================== LOAD DATA FROM LOCALSTORAGE ====================
    const loadAllData = useCallback(() => {
        try {
            const savedAppointments = localStorage.getItem('appointments');
            if (savedAppointments) {
                setAppointments(JSON.parse(savedAppointments));
            } else {
                setAppointments([]);
            }
        } catch (e) {
            console.error("Failed to load appointments:", e);
        }

        try {
            const savedPatients = localStorage.getItem('patients');
            if (savedPatients) {
                setPatients(JSON.parse(savedPatients));
            } else {
                setPatients([]);
            }
        } catch (e) {
            console.error("Failed to load patients:", e);
        }

        try {
            const savedAdmissions = localStorage.getItem('admissions');
            if (savedAdmissions) {
                setAdmissions(JSON.parse(savedAdmissions));
            } else {
                setAdmissions([]);
            }
        } catch (e) {
            console.error("Failed to load admissions:", e);
        }
    }, []);

    // Load data on mount AND every time the component remounts (navigation)
    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // Re-read data when the window gains focus (e.g., user switches tabs)
    useEffect(() => {
        const handleFocus = () => loadAllData();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [loadAllData]);

    // Listen for storage events (changes from other tabs)
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "appointments" || e.key === "patients" || e.key === "admissions") {
                loadAllData();
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [loadAllData]);

    // Listen for a custom event so same-tab updates are picked up too
    useEffect(() => {
        const handleCustom = () => loadAllData();
        window.addEventListener("appointmentsUpdated", handleCustom);
        return () => window.removeEventListener("appointmentsUpdated", handleCustom);
    }, [loadAllData]);

    // ==================== HELPER FUNCTIONS ====================
    const getTodaysAppointments = () => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === today);
    };

    const getPendingAppointments = () => {
        return appointments.filter(apt => apt.status === "Pending");
    };

    const getCompletedAppointments = () => {
        return appointments.filter(apt => apt.status === "Completed");
    };

    const getConfirmedAppointments = () => {
        return appointments.filter(apt => apt.status === "Confirmed");
    };

    // ==================== STATISTICS ====================
    // Same pattern as DashboardHome.js stats array
    // Each stat has a `filter` key used as a query param when clicked
    const stats = [
        { label: "Today's Appointments", value: getTodaysAppointments().length, icon: "📅", color: "#1976d2", filter: "today" },
        { label: "Total Appointments", value: appointments?.length || 0, icon: "🗓️", color: "#388e3c", filter: "all" },
        { label: "Pending", value: getPendingAppointments().length, icon: "⏳", color: "#f57c00", filter: "Pending" },
        { label: "Completed", value: getCompletedAppointments().length, icon: "✅", color: "#7b1fa2", filter: "Completed" },
    ];

    // Navigate to appointments with the selected filter
    const handleStatClick = (filter) => {
        navigate(`/doctor-dashboard/appointments?filter=${filter}`);
    };

    // ==================== RECENT ACTIVITIES ====================
    // Same pattern as DashboardHome.js
    const recentActivities = [
        ...(appointments?.slice(-3).map(apt => ({
            time: `${apt.date} ${apt.time}`,
            activity: `Appointment with ${apt.patientName}`,
            type: "appointment"
        })) || []),
        ...(patients?.slice(-3).map(pat => ({
            time: `${pat.registeredDate} ${pat.registeredTime}`,
            activity: `Patient registered: ${pat.patientName}`,
            type: "registration"
        })) || []),
        ...(admissions?.slice(-3).map(adm => ({
            time: `${adm.admissionDate} ${adm.admissionTime}`,
            activity: `Patient admitted: ${adm.patientName} (Bed ${adm.bedNo})`,
            type: "admission"
        })) || [])
    ].sort((a, b) => b.time?.localeCompare(a.time)).slice(0, 5);

    return (
        <div className="dashboard-home">
            {/* ==================== PAGE HEADER ==================== */}
            {/* EXACT SAME as DashboardHome.js */}
            <div className="dashboard-header">
                <h1 style={{ color: "white" }}>Welcome, Dr. Pranjal Patil</h1>
                <p className="subtitle" style={{ color: "white" }}>
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                </p>
            </div>

            {/* ==================== STATISTICS CARDS ==================== */}
            {/* Clickable cards — navigate to appointments with filter */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        onClick={() => handleStatClick(stat.filter)}
                        style={{
                            borderLeft: `4px solid ${stat.color}`,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                            e.currentTarget.style.boxShadow = `0 12px 24px ${stat.color}30`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow = "";
                        }}
                        title={`Click to view ${stat.label.toLowerCase()}`}
                    >
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ==================== QUICK ACTIONS ==================== */}
            {/* EXACT SAME as DashboardHome.js */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => navigate("/doctor-dashboard/appointments")}>
                        <span className="action-icon">📅</span>
                        <span>View Appointments</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate("/doctor-dashboard/patients")}>
                        <span className="action-icon">👥</span>
                        <span>My Patients</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate("/doctor-dashboard/bedview")}>
                        <span className="action-icon">🛏️</span>
                        <span>Bed View</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate("/doctor-dashboard/admitlist")}>
                        <span className="action-icon">🏥</span>
                        <span>Admitted List</span>
                    </button>
                </div>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => navigate("/doctor-dashboard/profile")}>
                        <span className="action-icon">👨‍⚕️</span>
                        <span>My Profile</span>
                    </button>
                </div>
            </div>

            {/* ==================== RECENT ACTIVITIES ==================== */}
            {/* EXACT SAME as DashboardHome.js */}
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
                        <div className="no-activities">
                            <p>No recent activities</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboardHome;
