import React, { useState, useEffect } from "react";
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

    // ==================== LOAD DATA ====================
    useEffect(() => {
        const savedAppointments = localStorage.getItem('appointments');
        if (savedAppointments) setAppointments(JSON.parse(savedAppointments));

        const savedPatients = localStorage.getItem('patients');
        if (savedPatients) setPatients(JSON.parse(savedPatients));

        const savedAdmissions = localStorage.getItem('admissions');
        if (savedAdmissions) setAdmissions(JSON.parse(savedAdmissions));
    }, []);

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

    const getAdmittedPatients = () => {
        return admissions.filter(adm => adm.status === "Admitted");
    };

    // ==================== STATISTICS ====================
    // Same pattern as DashboardHome.js stats array
    const stats = [
        { label: "Today's Appointments", value: getTodaysAppointments().length, icon: "📅", color: "#1976d2" },
        { label: "Total Appointments", value: appointments?.length || 0, icon: "🗓️", color: "#388e3c" },
        { label: "Pending", value: getPendingAppointments().length, icon: "⏳", color: "#f57c00" },
        { label: "Completed", value: getCompletedAppointments().length, icon: "✅", color: "#7b1fa2" },
    ];

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
            {/* EXACT SAME as DashboardHome.js */}
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
