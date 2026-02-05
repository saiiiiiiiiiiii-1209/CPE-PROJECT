import React from "react";
// ==================== REACT ROUTER DOM ====================
// Routes: Container for all route definitions
// Route: Individual route mapping path to component
// Navigate: Redirect component for unknown routes
// useLocation: Hook to get current location for animations
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// ==================== FRAMER MOTION ====================
// AnimatePresence: Enables animation when components are removed from DOM
// mode="wait": Ensures exit animation completes before new entry animation starts
import { AnimatePresence } from "framer-motion";

// ==================== IMPORT COMPONENTS ====================
// HomePages: Landing page component
// ReceptionistDashboard: Main dashboard layout with sidebar
// DoctorDashboard: Doctor dashboard layout with sidebar
// DashboardHome: Dashboard home/overview page
// Appointments: Appointments management page
// Patients: Patients management page
// Doctors: Doctors management page
// Reports: Reports and analytics page
// Services: Hospital services listing page
// DoctorDashboardHome: Doctor dashboard home page
// DoctorAppointments: Doctor appointments management
// DoctorPatients: Doctor patients management
// DoctorProfile: Doctor profile management
import HomePages from "./Webpages/HomePages";
import ReceptionistDashboard from "./Webpages/ReceptionistDashboard";
import DoctorDashboard from "./Webpages/DoctorDashboard";
import DashboardHome from "./Webpages/DashboardHome";
import Appointments from "./Webpages/Appointments";
import Patients from "./Webpages/Patients";
import Doctors from "./Webpages/Doctors";
import Reports from "./Webpages/Reports";
import Services from "./Webpages/Services";
import DoctorDashboardHome from "./Webpages/doctor/DoctorDashboardHome";
import DoctorAppointments from "./Webpages/doctor/DoctorAppointments";
import DoctorPatients from "./Webpages/doctor/DoctorPatients";
import DoctorProfile from "./Webpages/doctor/DoctorProfile";

function App() {
  // ==================== LOCATION HOOK ====================
  // Used by AnimatePresence to track route changes for animations
  const location = useLocation();

  return (
    // ==================== ANIMATE PRESENCE ====================
    // Wraps Routes to enable smooth page transitions
    // mode="wait": Waits for exit animation before showing new page
    // key={location.pathname}: Triggers animation on route change
    <AnimatePresence mode="wait">
      <Routes>

        {/* ==================== LANDING PAGE ==================== */}
        {/* Home page with login buttons for Receptionist/Doctor */}
        <Route path="/" element={<HomePages />} />

        {/* ==================== RECEPTIONIST DASHBOARD LAYOUT ==================== */}
        {/* This route uses a nested structure with ReceptionistDashboard as parent */}
        {/* The Outlet in ReceptionistDashboard renders the child routes below */}
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />}>

          {/* Dashboard Home - Overview page with stats and quick actions */}
          <Route index element={<DashboardHome />} />

          {/* Appointments - Appointment management page */}
          <Route path="appointments" element={<Appointments />} />

          {/* Patients - Patient management page */}
          <Route path="patients" element={<Patients />} />

          {/* Doctors - Doctor information page */}
          <Route path="doctors" element={<Doctors />} />

          {/* Reports - Analytics and reports page */}
          <Route path="reports" element={<Reports />} />

          {/* Services - Hospital services listing page */}
          <Route path="services" element={<Services />} />

        </Route>

        {/* ==================== DOCTOR DASHBOARD LAYOUT ==================== */}
        {/* This route uses a nested structure with DoctorDashboard as parent */}
        {/* The Outlet in DoctorDashboard renders the child routes below */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />}>

          {/* Doctor Dashboard Home - Overview page with stats and quick actions */}
          <Route index element={<DoctorDashboardHome />} />

          {/* My Appointments - Doctor's appointment management page */}
          <Route path="appointments" element={<DoctorAppointments />} />

          {/* My Patients - Doctor's patient management page */}
          <Route path="patients" element={<DoctorPatients />} />

          {/* My Profile - Doctor's profile management page */}
          <Route path="profile" element={<DoctorProfile />} />

        </Route>

        {/* ==================== UNKNOWN ROUTES ==================== */}
        {/* Redirect any unknown URL back to home page */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </AnimatePresence>
  );
}

export default App;
