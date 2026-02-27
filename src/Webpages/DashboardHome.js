import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "./AppointmentForm";
import PatientRegistrationForm from "./PatientRegistrationForm";
import AdmitPatientForm from "./AdmitPatientForm";
import "./DashboardHome.css";


function DashboardHome() {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [loading, setLoading] = useState(true);

  // Stats from backend
  const [patientStats, setPatientStats] = useState({ total: 0, male: 0, female: 0, other: 0 });
  const [admissionStats, setAdmissionStats] = useState({ total: 0, admitted: 0, discharged: 0 });
  const [appointmentStats, setAppointmentStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });

  // ==================== FETCH DATA FROM BACKEND API ====================
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [patientsRes, patientStatsRes, admissionsRes, admissionStatsRes, appointmentsRes, appointmentStatsRes] = await Promise.allSettled([
          fetch('http://localhost:8001/api/patients'),
          fetch('http://localhost:8001/api/patients/stats'),
          fetch('http://localhost:8001/api/admitpatient'),
          fetch('http://localhost:8001/api/admissionstats'),
          fetch('http://localhost:8001/api/appointmentfindall'),
          fetch('http://localhost:8001/api/appointments/stats'),
        ]);

        // Process patients
        if (patientsRes.status === 'fulfilled' && patientsRes.value.ok) {
          const data = await patientsRes.value.json();
          if (data.success) {
            setPatients(data.data || []);
          }
        }

        // Process patient stats
        if (patientStatsRes.status === 'fulfilled' && patientStatsRes.value.ok) {
          const data = await patientStatsRes.value.json();
          if (data.success) {
            setPatientStats(data.data || { total: 0, male: 0, female: 0, other: 0 });
          }
        }

        // Process admissions
        if (admissionsRes.status === 'fulfilled' && admissionsRes.value.ok) {
          const data = await admissionsRes.value.json();
          if (data.success) {
            setAdmissions(data.data || []);
          }
        }

        // Process admission stats
        if (admissionStatsRes.status === 'fulfilled' && admissionStatsRes.value.ok) {
          const data = await admissionStatsRes.value.json();
          if (data.success) {
            setAdmissionStats(data.data || { total: 0, admitted: 0, discharged: 0 });
          }
        }

        // Process appointments
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.ok) {
          const data = await appointmentsRes.value.json();
          if (data.success) {
            setAppointments(data.appointments || data.data || []);
            if (data.stats) {
              setAppointmentStats(data.stats);
            }
          }
        }

        // Process appointment stats
        if (appointmentStatsRes.status === 'fulfilled' && appointmentStatsRes.value.ok) {
          const data = await appointmentStatsRes.value.json();
          if (data.success) {
            setAppointmentStats(data.data || { total: 0, pending: 0, completed: 0, cancelled: 0 });
          }
        }

      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ==================== COMPUTED VALUES ====================
  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today);
  };

  const getAdmittedCount = () => {
    // Prefer stats from backend, fallback to counting from data
    if (admissionStats.admitted > 0) return admissionStats.admitted;
    return admissions.filter(adm => adm.status === "Admitted").length;
  };

  // ==================== PATIENT FUNCTIONS ====================
  const searchPatients = (query) => {
    if (!query) return [];
    return patients.filter(p =>
      p.patientName?.toLowerCase().includes(query.toLowerCase()) ||
      p.phone?.includes(query) ||
      p.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // ==================== ADMISSION FUNCTIONS ====================
  const addAdmission = (admission) => {
    const newAdmission = {
      id: `ADM-${Date.now()}`,
      ...admission,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: "Admitted"
    };
    setAdmissions(prev => [...prev, newAdmission]);
    return newAdmission;
  };

  const addAppointment = (appointment) => {
    const newAppointment = {
      id: `APT-${Date.now()}`,
      ...appointment,
      status: appointment.status || "Pending"
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const addPatient = (patient) => {
    const newPatient = {
      id: `PAT-${Date.now()}`,
      ...patient,
      registeredDate: new Date().toISOString().split('T')[0],
      registeredTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const getAvailableBeds = () => {
    const totalBeds = 20;
    const occupiedBeds = admissions.filter(adm => adm.status === "Admitted").map(adm => adm.bedNo);
    const allBeds = Array.from({ length: totalBeds }, (_, i) => `B${i + 1}`);
    return allBeds.filter(bed => !occupiedBeds.includes(bed));
  };

  // ==================== POPUP HANDLERS ====================
  const openPopup = (type) => {
    setPopupType(type);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupType("");
  };

  // ==================== STATISTICS (from backend API) ====================
  const stats = [
    { label: "Total Patients", value: patientStats.total || patients.length || 0, icon: "👥", color: "#1976d2" },
    { label: "Admitted Patients", value: getAdmittedCount(), icon: "🛏️", color: "#d32f2f" },
    { label: "Total Appointments", value: appointmentStats.total || appointments.length || 0, icon: "📅", color: "#f57c00" },
    { label: "Today's Appointments", value: getTodaysAppointments().length, icon: "🗓️", color: "#388e3c" },
  ];

  // Recent activities from backend data
  const recentActivities = [
    ...(appointments?.slice(-3).map(apt => ({
      time: `${apt.date || ''} ${apt.time || ''}`,
      activity: `Appointment booked for ${apt.patientName || 'Unknown'}`,
      type: "appointment"
    })) || []),
    ...(patients?.slice(-3).map(pat => ({
      time: `${pat.registeredDate || pat.createdAt || ''} ${pat.registeredTime || ''}`,
      activity: `New patient registered: ${pat.patientName || 'Unknown'}`,
      type: "registration"
    })) || []),
    ...(admissions?.slice(-3).map(adm => ({
      time: `${adm.fromDate || adm.admissionDate || ''} ${adm.admissionTime || ''}`,
      activity: `Patient admitted: ${adm.patientName || 'Unknown'} (Bed ${adm.bedNo || '-'})`,
      type: "admission"
    })) || [])
  ].sort((a, b) => (b.time || '').localeCompare(a.time || '')).slice(0, 5);

  return (
    <div className="dashboard-home">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="dashboard-header">
        <h1 style={{ color: "white" }}>Welcome to Reception Dashboard</h1>
        <p className="subtitle" style={{ color: "white" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* ==================== STATISTICS CARDS ==================== */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== QUICK ACTIONS ==================== */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => openPopup("appointment")}>
            <span className="action-icon">📅</span>
            <span>Book Appointment</span>
          </button>
          <button className="action-btn" onClick={() => openPopup("patient")}>
            <span className="action-icon">➕</span>
            <span>Add New Patient</span>
          </button>
          <button className="action-btn" onClick={() => openPopup("admit")}>
            <span className="action-icon">🏥</span>
            <span>Admit Patient</span>
          </button>
          <button className="action-btn" onClick={() => navigate("/receptionist-dashboard/BedView")}>
            <span className="action-icon">👨‍⚕️</span>
            <span>Available Facilities</span>
          </button>
        </div>
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/appointment")}
          >
            <span className="action-icon">📋</span>
            <span>Appointment List</span>
          </button>

          <button
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/Patientlist")}
          >
            <span className="action-icon">👥</span>
            <span>All Patient List</span>
          </button>

          <button
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/admitlist")}
          >
            <span className="action-icon">🛏️</span>
            <span>Admitted List</span>
          </button>

          <button
            className="action-btn"
            onClick={() => navigate("/receptionist-dashboard/laboratory")}
          >
            <span className="action-icon">🔬</span>
            <span>Laboratory</span>
          </button>
        </div>

      </div>

      {/* ==================== RECENT ACTIVITIES ==================== */}
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
              <p>{loading ? 'Loading activities...' : 'No recent activities'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== FORMS ==================== */}
      {showPopup && popupType === "appointment" && (
        <AppointmentForm
          onClose={closePopup}
          addAppointment={addAppointment}
          appointments={appointments}
        />
      )}

      {showPopup && popupType === "patient" && (
        <PatientRegistrationForm
          onClose={closePopup}
          addPatient={addPatient}
          patients={patients}
        />
      )}

      {showPopup && popupType === "admit" && (
        <AdmitPatientForm
          onClose={closePopup}
          addAdmission={addAdmission}
          searchPatients={searchPatients}
          getAvailableBeds={getAvailableBeds}
          availableBeds={getAvailableBeds()}
        />
      )}
    </div>
  );
}

export default DashboardHome;