import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "../Appointment.css";

// ==================== DOCTOR APPOINTMENTS PAGE ====================
// Uses the EXACT SAME CSS as Webpages/Appointment.css
// Same class names: appointments-page, page-header, stats-grid, stat-card,
// filters-section, table-container, data-table, status-select, action-buttons, etc.

function DoctorAppointments() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ==================== STATES ====================
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
    const [activeFilterLabel, setActiveFilterLabel] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showViewPopup, setShowViewPopup] = useState(false);

    // ==================== VIEW HANDLER ====================
    const handleView = (apt) => {
        setSelectedAppointment(apt);
        setShowViewPopup(true);
    };

    // ==================== LOAD DATA ====================
    useEffect(() => {
        const savedAppointments = localStorage.getItem('appointments');
        if (savedAppointments) {
            setAppointments(JSON.parse(savedAppointments));
        }
        setLoading(false);
    }, []);

    // ==================== APPLY FILTER FROM URL QUERY PARAM ====================
    useEffect(() => {
        const filter = searchParams.get("filter");
        if (!filter) return;

        if (filter === "today") {
            const today = new Date().toISOString().split('T')[0];
            setDateFilter(today);
            setStatusFilter("all");
            setActiveFilterLabel("Today's Appointments");
        } else if (filter === "all") {
            setDateFilter("");
            setStatusFilter("all");
            setActiveFilterLabel("All Appointments");
        } else if (filter === "Pending" || filter === "Completed" || filter === "Confirmed" || filter === "Cancelled") {
            setStatusFilter(filter);
            setDateFilter("");
            setActiveFilterLabel(`${filter} Appointments`);
        }

        // Clear the query param so it doesn't persist on refresh
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

    // ==================== SAVE DATA ====================
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('appointments', JSON.stringify(appointments));
            // Dispatch custom event so DoctorDashboardHome picks up the change
            window.dispatchEvent(new Event("appointmentsUpdated"));
        }
    }, [appointments, loading]);

    // ==================== HELPER FUNCTIONS ====================
    const getTodaysAppointments = () => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === today);
    };

    // ==================== STATUS UPDATE ====================
    const handleStatusChange = (id, newStatus) => {
        setAppointments(prev =>
            prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
        );
    };

    // ==================== DELETE ====================
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            setAppointments(prev => prev.filter(apt => apt.id !== id));
        }
    };

    // ==================== SORT ====================
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    // ==================== FILTER & SORT ====================
    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        // Search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(apt =>
                apt.patientName?.toLowerCase().includes(q) ||
                apt.phone?.includes(q) ||
                apt.email?.toLowerCase().includes(q) ||
                apt.id?.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(apt => apt.status === statusFilter);
        }

        // Date filter
        if (dateFilter) {
            result = result.filter(apt => apt.date === dateFilter);
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
            if (sortConfig.direction === "asc") return aVal.localeCompare(bVal);
            return bVal.localeCompare(aVal);
        });

        return result;
    }, [appointments, searchTerm, statusFilter, dateFilter, sortConfig]);

    // ==================== STATISTICS ====================
    const statCards = [
        { label: "Total", value: appointments.length, icon: "📋", className: "total" },
        { label: "Today", value: getTodaysAppointments().length, icon: "📅", className: "today" },
        { label: "Pending", value: appointments.filter(a => a.status === "Pending").length, icon: "⏳", className: "pending" },
        { label: "Confirmed", value: appointments.filter(a => a.status === "Confirmed").length, icon: "✔️", className: "confirmed" },
        { label: "Completed", value: appointments.filter(a => a.status === "Completed").length, icon: "✅", className: "completed" },
        { label: "Cancelled", value: appointments.filter(a => a.status === "Cancelled").length, icon: "❌", className: "cancelled" },
    ];

    // ==================== FILTER HANDLERS ====================
    const showTodayOnly = () => {
        setDateFilter(new Date().toISOString().split('T')[0]);
        setStatusFilter("all");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("");
        setActiveFilterLabel("");
    };

    if (loading) {
        return (
            <div className="appointments-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            {/* ==================== PAGE HEADER ==================== */}
            <div className="page-header">
                <div>
                    <h1>📋 My Appointments</h1>
                </div>
                <div className="header-actions">
                    <button className="refresh-btn" onClick={() => window.location.reload()}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* ===== ACTIVE FILTER BANNER (from dashboard stat card click) ===== */}
            {activeFilterLabel && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    marginBottom: "20px",
                    background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)",
                    border: "1px solid #93c5fd",
                    borderRadius: "12px",
                    animation: "fadeIn 0.3s ease",
                }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e40af" }}>
                        🔍 Showing: <strong>{activeFilterLabel}</strong>
                        <span style={{ fontWeight: "400", color: "#3b82f6", marginLeft: "8px" }}>
                            ({filteredAppointments.length} results)
                        </span>
                    </span>
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: "6px 16px",
                            background: "white",
                            border: "1px solid #93c5fd",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#1e40af",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#1e40af";
                            e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                            e.currentTarget.style.color = "#1e40af";
                        }}
                    >
                        ✕ Show All
                    </button>
                </div>
            )}

            {/* ==================== STATISTICS ==================== */}
            <div className="stats-grid">
                {statCards.map((stat, i) => (
                    <div key={i} className={`stat-card ${stat.className}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ==================== FILTERS ==================== */}
            <div className="filters-section">
                <h3>🔍 Search & Filter</h3>
                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Search by name, phone, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Date</label>
                        <input
                            type="date"
                            className="filter-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    <div className="filter-actions">
                        <button className="filter-btn today" onClick={showTodayOnly}>📅 Today</button>
                        <button className="filter-btn clear" onClick={clearFilters}>✕ Clear</button>
                    </div>
                </div>

                {/* Active filters */}
                {(searchTerm || statusFilter !== "all" || dateFilter) && (
                    <div className="active-filters">
                        <span>Active filters:</span>
                        {searchTerm && <span className="filter-badge">Search: {searchTerm}</span>}
                        {statusFilter !== "all" && <span className="filter-badge">Status: {statusFilter}</span>}
                        {dateFilter && <span className="filter-badge">Date: {dateFilter}</span>}
                    </div>
                )}
            </div>

            {/* ==================== TABLE ==================== */}
            <div className="table-container">
                <div className="table-header">
                    <h3>Appointment Records</h3>
                    <span className="record-count">{filteredAppointments.length} records</span>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                                    ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th onClick={() => handleSort("patientName")} style={{ cursor: "pointer" }}>
                                    Patient {sortConfig.key === "patientName" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                                    Date {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th>Time</th>
                                <th>Phone</th>
                                <th>Age/Gender</th>
                                <th>Symptoms</th>
                                <th>Status</th>
                                <th style={{ textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td><span className="appointment-id">{apt.id}</span></td>
                                        <td><span className="patient-name">{apt.patientName}</span></td>
                                        <td>{apt.date}</td>
                                        <td>{apt.time}</td>
                                        <td>{apt.phone || "-"}</td>
                                        <td>{apt.age || "-"} / {apt.gender || "-"}</td>
                                        <td className="symptoms-cell">
                                            <span className="symptoms-text">
                                                {Array.isArray(apt.symptoms) ? apt.symptoms.join(", ") : apt.symptoms || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={apt.status}
                                                onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                                className={`status-select ${(apt.status || "").toLowerCase()}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className="view-btn"
                                                title="View Details"
                                                onClick={() => handleView(apt)}
                                                style={{
                                                    fontSize: "18px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "6px 12px",
                                                    borderRadius: "8px",
                                                    transition: "background 0.2s",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#e0f2fe"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="no-data-row">
                                    <td colSpan="9">
                                        <div className="no-data-content">
                                            <span className="no-data-icon">📭</span>
                                            <p>No appointments found</p>
                                            {(searchTerm || statusFilter !== "all" || dateFilter) && (
                                                <button className="clear-filter-btn" onClick={clearFilters}>
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==================== VIEW POPUP ==================== */}
            {showViewPopup && selectedAppointment && (
                <div
                    className="popup-overlay"
                    onClick={() => setShowViewPopup(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        backdropFilter: "blur(4px)",
                        animation: "fadeIn 0.3s ease",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "560px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            background: "#fff",
                            padding: "32px",
                            borderRadius: "16px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            animation: "slideUp 0.3s ease",
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #e2e8f0" }}>
                            <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>📋 Appointment Details</h2>
                            <button
                                onClick={() => setShowViewPopup(false)}
                                style={{
                                    background: "#f1f5f9",
                                    border: "none",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: "#64748b",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Patient Info */}
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Patient Information</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Patient Name</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.patientName || "-"}</p>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Age / Gender</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.age || "-"} / {selectedAppointment.gender || "-"}</p>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Phone</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.phone || "-"}</p>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Email</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.email || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Info */}
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Appointment Details</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Date</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.date || "-"}</p>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Time</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.time || "-"}</p>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Status</p>
                                    <span style={{
                                        display: "inline-block",
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        backgroundColor:
                                            selectedAppointment.status === "Pending" ? "#fef3c7" :
                                                selectedAppointment.status === "Confirmed" ? "#dbeafe" :
                                                    selectedAppointment.status === "Completed" ? "#dcfce7" : "#fee2e2",
                                        color:
                                            selectedAppointment.status === "Pending" ? "#92400e" :
                                                selectedAppointment.status === "Confirmed" ? "#1e40af" :
                                                    selectedAppointment.status === "Completed" ? "#166534" : "#991b1b",
                                    }}>
                                        {selectedAppointment.status || "-"}
                                    </span>
                                </div>
                                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>ID</p>
                                    <p style={{ fontSize: "15px", color: "#1e293b", fontWeight: "600", margin: 0 }}>{selectedAppointment.appointmentId || selectedAppointment.id || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div style={{ marginBottom: "24px" }}>
                            <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Symptoms</h3>
                            <div style={{ padding: "14px 18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", lineHeight: "1.6" }}>
                                <p style={{ fontSize: "14px", color: "#334155", margin: 0 }}>
                                    {Array.isArray(selectedAppointment.symptoms)
                                        ? selectedAppointment.symptoms.join(", ")
                                        : selectedAppointment.symptoms || "No symptoms recorded"}
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowViewPopup(false)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)";
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorAppointments;
