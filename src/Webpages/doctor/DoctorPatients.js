import React, { useState, useEffect, useMemo } from "react";
import "../Patientlist.css";

// ==================== DOCTOR PATIENTS PAGE ====================
// Uses the EXACT SAME CSS classes as Webpages/Patientlist.js
// page-header, summary-stats, summary-card, search-container-fluid,
// search-input, table-container, data-table, action-cell, view-btn, etc.
// All styled by ReceptionistDashboard.css + Patientlist.css

function DoctorPatients() {
    // ==================== STATES ====================
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ total: 0, male: 0, female: 0, other: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // ==================== LOAD DATA ====================
    useEffect(() => {
        fetchPatients();
    }, []);

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
            // Fall back to localStorage
            const saved = localStorage.getItem('patients');
            if (saved) {
                const parsed = JSON.parse(saved);
                setPatients(parsed);
                setStats({
                    total: parsed.length,
                    male: parsed.filter(p => p.gender === "Male").length,
                    female: parsed.filter(p => p.gender === "Female").length,
                    other: parsed.filter(p => p.gender !== "Male" && p.gender !== "Female").length,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== FILTER ====================
    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        if (!searchTerm.trim()) return patients;

        const searchLower = searchTerm.toLowerCase().trim();

        return patients.filter((patient) => {
            const matches = (field) => {
                if (field === undefined || field === null) return false;
                return String(field).toLowerCase().includes(searchLower);
            };

            return (
                matches(patient.patientName) ||
                matches(patient.age) ||
                matches(patient.gender) ||
                matches(patient.email) ||
                matches(patient.phone) ||
                matches(patient.bloodGroup) ||
                matches(patient.id)
            );
        });
    }, [patients, searchTerm]);

    // ==================== HANDLERS ====================
    const handleView = (patient) => {
        setSelectedPatient(patient);
        setShowViewPopup(true);
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
                    alert('✅ Patient deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting patient:', error);
                // Fallback: remove from local state
                setPatients(prev => prev.filter(p => p.id !== id));
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading patients...</p>
            </div>
        );
    }

    return (
        <div className="patients-page">
            {/* ==================== HEADER ==================== */}
            {/* EXACT SAME as Patientlist.js */}
            <div className="page-header">
                <div>
                    <h1>👥 My Patients</h1>
                    <p style={{ marginLeft: "45px" }}>Total Patients: {stats.total || 0}</p>
                </div>
            </div>

            {/* ==================== SUMMARY STATS ==================== */}
            {/* EXACT SAME as Patientlist.js */}
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

            {/* ==================== SEARCH ==================== */}
            {/* EXACT SAME as Patientlist.js */}
            <div className="search-container-fluid">
                <input
                    type="text"
                    placeholder="Search by any field - name, gender, blood group, phone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* ==================== TABLE ==================== */}
            {/* EXACT SAME as Patientlist.js */}
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

            {/* ==================== VIEW POPUP ==================== */}
            {showViewPopup && selectedPatient && (
                <div className="popup-overlay" onClick={() => setShowViewPopup(false)}>
                    <div className="popup-card wide-popup" onClick={(e) => e.stopPropagation()}>
                        <h2>📋 {selectedPatient.patientName}'s Details</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <p><strong>Name:</strong> {selectedPatient.patientName}</p>
                            <p><strong>Age:</strong> {selectedPatient.age}</p>
                            <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                            <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                            <p><strong>Email:</strong> {selectedPatient.email}</p>
                            <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup || "N/A"}</p>
                            <p><strong>Address:</strong> {selectedPatient.address || "N/A"}</p>
                            <p><strong>DOB:</strong> {selectedPatient.dob || "N/A"}</p>
                        </div>
                        <div className="popup-actions">
                            <button className="cancel" onClick={() => setShowViewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorPatients;
