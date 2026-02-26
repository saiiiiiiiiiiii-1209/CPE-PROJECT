import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import "./ReceptionistDashboard.css";
import "./DoctorDashboard.css";

// ==================== DOCTOR DASHBOARD ====================
// Layout component — EXACT SAME sidebar as ReceptionistDashboard
// Uses the same ReceptionistDashboard.css for identical look

function DoctorDashboard() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const initialLoadDone = useRef(false);
  const navigate = useNavigate();

  // Load data on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    try {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) setPatients(JSON.parse(storedPatients));
    } catch (error) {
      console.error("Failed to load patients:", error);
    }

    try {
      const storedAdmissions = localStorage.getItem('admissions');
      if (storedAdmissions) {
        const parsed = JSON.parse(storedAdmissions);
        setAdmissions(prev => {
          const merged = [...prev, ...parsed];
          return merged;
        });
      }
    } catch (error) {
      console.error("Failed to load admissions:", error);
    }
  }, []);

  // Persist admissions
  useEffect(() => {
    if (admissions.length > 0) {
      localStorage.setItem('admissions', JSON.stringify(admissions));
    }
  }, [admissions]);

  const addAdmission = useCallback((newAdmission) => {
    setAdmissions(prev => {
      const updated = [...prev, { ...newAdmission, id: Date.now() }];
      return updated;
    });
  }, []);

  const getAvailableBeds = useCallback(() => {
    const totalBeds = 20;
    const isActive = (admission) => {
      if (!admission.toDate) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const discharge = new Date(admission.toDate);
      discharge.setHours(0, 0, 0, 0);
      return discharge >= today;
    };
    const occupiedBeds = admissions.filter(isActive).map(adm => adm.bedNo);
    const allBeds = Array.from({ length: totalBeds }, (_, i) => `B${i + 1}`);
    return allBeds.filter(bed => !occupiedBeds.includes(bed));
  }, [admissions]);

  const searchPatients = useCallback((query) => {
    return patients.filter(p =>
      p.patientName?.toLowerCase().includes(query.toLowerCase())
    );
  }, [patients]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate("/");
  };

  // ==================== SIDEBAR MENU ITEMS ====================
  // Same structure as ReceptionistDashboard
  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/doctor-dashboard" },
    { id: "appointments", label: "Appointments", icon: "📅", path: "/doctor-dashboard/appointments" },
    { id: "patients", label: "My Patients", icon: "👥", path: "/doctor-dashboard/patients" },
    { id: "admitlist", label: "Admitted List", icon: "🛏️", path: "/doctor-dashboard/admitlist" },
    { id: "bedview", label: "Bed View", icon: "📊", path: "/doctor-dashboard/bedview" },
    { id: "profile", label: "My Profile", icon: "👨‍⚕️", path: "/doctor-dashboard/profile" },
  ];

  return (
    <div className="reception-container doctor-dashboard-wrapper">
      {/* ==================== SIDEBAR ==================== */}
      {/* EXACT SAME markup as ReceptionistDashboard sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="hospital-logo">🏥</span>
            <div className="header-text">
              <h2>MediCare Hospital</h2>
              <p className="user-role">Dr. Pranjal Patil</p>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          {/* MAIN Section */}
          <div className="menu-section">
            <label className="menu-section-label">MAIN</label>
            <ul className="sidebar-menu">
              {mainMenuItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => isActive ? "active" : ""}
                    end={item.path === "/doctor-dashboard"}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Logout Button */}
          <div className="logout-container">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span className="menu-label">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="main-content">
        <Outlet
          context={{ admissions, addAdmission, getAvailableBeds, patients, searchPatients }}
        />
      </div>
    </div>
  );
}

export default DoctorDashboard;
