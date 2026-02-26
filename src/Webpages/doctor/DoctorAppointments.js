import React, { useState, useEffect, useMemo } from "react";
import "../Appointment.css";

// ==================== DOCTOR APPOINTMENTS PAGE ====================
// Uses the EXACT SAME CSS as Webpages/Appointment.css
// Same class names: appointments-page, page-header, stats-grid, stat-card,
// filters-section, table-container, data-table, status-select, action-buttons, etc.

function DoctorAppointments() {
    // ==================== STATES ====================
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

    // ==================== LOAD DATA ====================
    useEffect(() => {
        const savedAppointments = localStorage.getItem('appointments');
        if (savedAppointments) {
            setAppointments(JSON.parse(savedAppointments));
        }
        setLoading(false);
    }, []);

    // ==================== SAVE DATA ====================
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('appointments', JSON.stringify(appointments));
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
                                <th>Actions</th>
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
                                        <td>
                                            <div className="action-buttons">
                                                <button className="view-btn" title="View">👁️</button>
                                                <button className="delete-btn" title="Delete" onClick={() => handleDelete(apt.id)}>🗑️</button>
                                            </div>
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
        </div>
    );
}

export default DoctorAppointments;
