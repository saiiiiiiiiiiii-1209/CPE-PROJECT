import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Admitlist.css";

function AdmitList() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        admitted: 0,
        discharged: 0
    });
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDischargePopup, setShowDischargePopup] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [dischargeData, setDischargeData] = useState({
        dischargeDate: new Date().toISOString().split('T')[0],
        dischargeNotes: "",
        dischargeType: "Recovered"
    });
    const [admissions, setAdmissions] = useState([]);
    const [statusChangeId, setStatusChangeId] = useState(null);

    // Load admissions from localStorage on component mount
    useEffect(() => {
        const savedAdmissions = localStorage.getItem('admissions');
        if (savedAdmissions) {
            setAdmissions(JSON.parse(savedAdmissions));
        }
    }, []);

    // Save admissions to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('admissions', JSON.stringify(admissions));
    }, [admissions]);

    /* =======================
       STATISTICS
    ========================*/
    useEffect(() => {
        if (!admissions) return;

        const admittedCount = admissions.filter(a => a.status === "Admitted").length;
        const dischargedCount = admissions.filter(a => a.status === "Discharged").length;

        setStats({
            total: admissions.length,
            admitted: admittedCount,
            discharged: dischargedCount
        });
    }, [admissions]);

    /* =======================
       FILTER - SEARCH IN ALL FIELDS
    ========================*/
    const filteredAdmissions = useMemo(() => {
        if (!admissions) return [];

        if (!searchTerm.trim()) return admissions;

        const searchLower = searchTerm.toLowerCase().trim();

        return admissions.filter((admission) => {
            const matches = (field) => {
                if (field === undefined || field === null) return false;
                return String(field).toLowerCase().includes(searchLower);
            };

            const symptomsMatch = admission.symptoms &&
                (Array.isArray(admission.symptoms)
                    ? admission.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower))
                    : String(admission.symptoms).toLowerCase().includes(searchLower));

            return (
                matches(admission.patientName) ||
                matches(admission.patientId) ||
                matches(admission.age) ||
                matches(admission.gender) ||
                matches(admission.phone) ||
                matches(admission.bedNo) ||
                matches(admission.fromDate) ||
                matches(admission.toDate) ||
                matches(admission.admittingDoctor) ||
                matches(admission.nameOfKin) ||
                matches(admission.kinContact) ||
                matches(admission.status) ||
                matches(admission.address) ||
                symptomsMatch
            );
        });
    }, [admissions, searchTerm]);

    /* =======================
       HANDLERS
    ========================*/
    const handleView = (admission) => {
        setSelectedAdmission(admission);
        setShowViewPopup(true);
    };

    const handleEdit = (admission) => {
        setSelectedAdmission(admission);
        setEditFormData({ ...admission });
        setEditErrors({});
        setShowEditPopup(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        
        // Phone validation
        if (name === "phone" || name === "kinContact") {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 10) {
                setEditFormData(prev => ({ ...prev, [name]: cleaned }));
            }
        } 
        // Age validation
        else if (name === "age") {
            if (value === "" || /^\d+$/.test(value)) {
                const ageNum = parseInt(value);
                if (value === "" || (ageNum >= 0 && ageNum <= 120)) {
                    setEditFormData(prev => ({ ...prev, [name]: value }));
                }
            }
        } 
        // Other fields
        else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        
        // Update admission
        setAdmissions(prev =>
            prev.map(adm =>
                adm.id === selectedAdmission.id
                    ? { ...adm, ...editFormData }
                    : adm
            )
        );

        setShowEditPopup(false);
        setEditErrors({});
        alert(`✅ Admission record updated successfully!`);
    };

    const handleDischarge = (admission) => {
        setSelectedAdmission(admission);
        setDischargeData({
            dischargeDate: new Date().toISOString().split('T')[0],
            dischargeNotes: "",
            dischargeType: "Recovered"
        });
        setShowDischargePopup(true);
    };

    const handleDischargeChange = (e) => {
        const { name, value } = e.target;
        setDischargeData(prev => ({ ...prev, [name]: value }));
    };

    const handleDischargeConfirm = () => {
        setAdmissions(prev =>
            prev.map(adm =>
                adm.id === selectedAdmission.id
                    ? {
                        ...adm,
                        status: "Discharged",
                        dischargeDate: dischargeData.dischargeDate,
                        dischargeNotes: dischargeData.dischargeNotes,
                        dischargeType: dischargeData.dischargeType
                    }
                    : adm
            )
        );

        setShowDischargePopup(false);
        setStatusChangeId(null);
        alert(`✅ Patient ${selectedAdmission.patientName} discharged successfully!`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this admission record?")) {
            setAdmissions(prev => prev.filter(adm => adm.id !== id));
        }
    };

    const handleStatusChange = (id, newStatus) => {
        if (newStatus === "Discharged") {
            const admission = admissions.find(adm => adm.id === id);
            if (admission) {
                setSelectedAdmission(admission);
                setDischargeData({
                    dischargeDate: new Date().toISOString().split('T')[0],
                    dischargeNotes: "",
                    dischargeType: "Recovered"
                });
                setShowDischargePopup(true);
            }
        } else {
            setAdmissions(prev =>
                prev.map(adm =>
                    adm.id === id ? { ...adm, status: newStatus } : adm
                )
            );
        }
    };

    const inputStyle = {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box"
    };

    const errorStyle = {
        border: "1px solid #dc3545",
        backgroundColor: "#fff8f8"
    };

    return (
        <div className="admitlist-page">

            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h1>🛏️ Admit List</h1>
                    <p style={{ marginLeft: "45px" }}>Total Patients: {stats.total || 0}</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                        className="bed-view-btn" 
                        onClick={() => navigate("/receptionist-dashboard/bedview")}
                        style={{
                            background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(13,110,253,0.3)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0px)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        <span>🛏️</span>
                        <span>Bed View</span>
                    </button>
                    
                    <button className="add-btn" onClick={() => navigate("/receptionist-dashboard")}>
                        <span> ← Back to Dashboard</span>
                    </button>
                </div>
            </div>

            {/* SUMMARY STATS */}
            <div className="summary-stats">
                <div className="summary-card" style={{ borderLeft: "4px solid #0d6efd" }}>
                    <h4>📊 TOTAL PATIENTS</h4>
                    <h2>{stats.total}</h2>
                </div>

                <div className="summary-card" style={{ borderLeft: "4px solid #28a745" }}>
                    <h4>🟢 ADMITTED</h4>
                    <h2>{stats.admitted}</h2>
                </div>

                <div className="summary-card" style={{ borderLeft: "4px solid #dc3545" }}>
                    <h4>🔴 DISCHARGED</h4>
                    <h2>{stats.discharged}</h2>
                </div>
            </div><br />

            {/* SEARCH */}
            <div className="search-container-fluid">
                <input
                    type="text"
                    placeholder="Search by patient name, bed no, doctor, symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* TABLE */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Patient Name</th>
                            <th>Age/Gender</th>
                            <th>Phone</th>
                            <th>Bed No</th>
                            <th>Admission Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAdmissions.length > 0 ? (
                            filteredAdmissions.map((admission, index) => (
                                <tr key={admission.id}>
                                    <td>{index + 1}</td>
                                    <td>{admission.patientName}</td>
                                    <td>
                                        {admission.age || "-"} / {admission.gender || "-"}
                                    </td>
                                    <td>{admission.phone}</td>
                                    <td><strong>{admission.bedNo}</strong></td>
                                    <td>{admission.fromDate || admission.admissionDate}</td>
                                    <td>
                                        <select
                                            value={admission.status}
                                            onChange={(e) => handleStatusChange(admission.id, e.target.value)}
                                            className={`status-select ${admission.status === "Admitted" ? "status-admitted" : "status-discharged"}`}
                                            style={{
                                                padding: "5px 10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                backgroundColor: admission.status === "Admitted" ? "#d4edda" : "#f8d7da",
                                                color: admission.status === "Admitted" ? "#155724" : "#721c24",
                                                borderColor: admission.status === "Admitted" ? "#c3e6cb" : "#f5c6cb"
                                            }}
                                        >
                                            <option value="Admitted" style={{ backgroundColor: "#d4edda", color: "#155724" }}>Admitted</option>
                                            <option value="Discharged" style={{ backgroundColor: "#f8d7da", color: "#721c24" }}>Discharged</option>
                                        </select>
                                    </td>

                                    <td className="action-cell">
                                        <button
                                            className="view-btn"
                                            onClick={() => handleView(admission)}
                                            title="View Details"
                                        >
                                            👁️
                                        </button>

                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(admission)}
                                            title="Edit Admission"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(admission.id)}
                                            title="Delete Record"
                                        >
                                            ❌
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                    No admissions found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* VIEW POPUP */}
            {showViewPopup && selectedAdmission && (
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
                    }}
                >
                    <div
                        className="popup-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "600px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            background: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, color: "#2c3e50" }}>🏥 Admission Details</h2>
                            <button
                                onClick={() => setShowViewPopup(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            {/* Patient Information */}
                            <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Patient Information</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div><strong>Patient ID:</strong> {selectedAdmission.patientId || selectedAdmission.id}</div>
                                    <div><strong>Patient Name:</strong> {selectedAdmission.patientName}</div>
                                    <div><strong>Age:</strong> {selectedAdmission.age}</div>
                                    <div><strong>Gender:</strong> {selectedAdmission.gender}</div>
                                    <div><strong>Phone:</strong> {selectedAdmission.phone}</div>
                                    <div><strong>Address:</strong> {selectedAdmission.address || "-"}</div>
                                </div>
                            </div>

                            {/* Admission Information */}
                            <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Admission Information</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div><strong>Admission ID:</strong> {selectedAdmission.id}</div>
                                    <div><strong>Bed Number:</strong> {selectedAdmission.bedNo}</div>
                                    <div><strong>Admission Date:</strong> {selectedAdmission.fromDate || selectedAdmission.admissionDate}</div>
                                    <div><strong>Admission Time:</strong> {selectedAdmission.admissionTime || "-"}</div>
                                    <div><strong>Expected Discharge:</strong> {selectedAdmission.toDate || "-"}</div>
                                    <div><strong>Admitting Doctor:</strong> {selectedAdmission.admittingDoctor || "-"}</div>
                                    <div><strong>Status:</strong> {selectedAdmission.status}</div>
                                </div>
                            </div>

                            {/* Symptoms */}
                            {selectedAdmission.symptoms && selectedAdmission.symptoms.length > 0 && (
                                <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Symptoms</h3>
                                    <div>
                                        {Array.isArray(selectedAdmission.symptoms)
                                            ? selectedAdmission.symptoms.join(", ")
                                            : selectedAdmission.symptoms}
                                    </div>
                                </div>
                            )}

                            {/* Emergency Contact */}
                            <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Emergency Contact</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div><strong>Contact Person:</strong> {selectedAdmission.nameOfKin || "-"}</div>
                                    <div><strong>Contact Number:</strong> {selectedAdmission.kinContact || "-"}</div>
                                </div>
                            </div>

                            {/* Discharge Information */}
                            {selectedAdmission.status === "Discharged" && (
                                <div style={{ gridColumn: "span 2", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#dc3545", fontSize: "16px" }}>Discharge Information</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                        <div><strong>Discharge Date:</strong> {selectedAdmission.dischargeDate}</div>
                                        <div><strong>Discharge Type:</strong> {selectedAdmission.dischargeType || "-"}</div>
                                        <div><strong>Discharge Notes:</strong> {selectedAdmission.dischargeNotes || "-"}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: "25px", textAlign: "right" }}>
                            <button
                                onClick={() => setShowViewPopup(false)}
                                style={{
                                    background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                                    color: "#fff",
                                    padding: "10px 25px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT POPUP */}
            {showEditPopup && selectedAdmission && (
                <div
                    className="popup-overlay"
                    onClick={() => setShowEditPopup(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="popup-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "600px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            background: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, color: "#2c3e50" }}>✏️ Edit Admission</h2>
                            <button
                                onClick={() => setShowEditPopup(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {/* Patient Information */}
                                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Patient Information</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Patient Name</label>
                                            <input
                                                name="patientName"
                                                value={editFormData.patientName || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Age</label>
                                            <input
                                                name="age"
                                                type="number"
                                                value={editFormData.age || ""}
                                                onChange={handleEditChange}
                                                min="1"
                                                max="120"
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Gender</label>
                                            <select
                                                name="gender"
                                                value={editFormData.gender || "Male"}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Address</label>
                                            <input
                                                name="address"
                                                value={editFormData.address || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Phone</label>
                                            <input
                                                name="phone"
                                                value={editFormData.phone || ""}
                                                onChange={handleEditChange}
                                                maxLength="10"
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Admission Details */}
                                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Admission Details</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Bed Number</label>
                                            <input
                                                name="bedNo"
                                                value={editFormData.bedNo || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Admission Date</label>
                                            <input
                                                name="fromDate"
                                                type="date"
                                                value={editFormData.fromDate || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Expected Discharge</label>
                                            <input
                                                name="toDate"
                                                type="date"
                                                value={editFormData.toDate || ""}
                                                onChange={handleEditChange}
                                                min={editFormData.fromDate}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Admitting Doctor</label>
                                            <input
                                                name="admittingDoctor"
                                                value={editFormData.admittingDoctor || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#0d6efd", fontSize: "16px" }}>Emergency Contact</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Contact Person</label>
                                            <input
                                                name="nameOfKin"
                                                value={editFormData.nameOfKin || ""}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Contact Number</label>
                                            <input
                                                name="kinContact"
                                                value={editFormData.kinContact || ""}
                                                onChange={handleEditChange}
                                                maxLength="10"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowEditPopup(false)}
                                    style={{
                                        background: "linear-gradient(135deg, #6c757d, #5c636a)",
                                        color: "#fff",
                                        padding: "10px 25px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: "linear-gradient(135deg, #28a745, #218838)",
                                        color: "#fff",
                                        padding: "10px 25px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DISCHARGE POPUP */}
            {showDischargePopup && selectedAdmission && (
                <div
                    className="popup-overlay"
                    onClick={() => setShowDischargePopup(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="popup-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "500px",
                            background: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, color: "#2c3e50" }}>🏥 Discharge Patient</h2>
                            <button
                                onClick={() => setShowDischargePopup(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                            <p><strong>Patient:</strong> {selectedAdmission.patientName}</p>
                            <p><strong>Bed No:</strong> {selectedAdmission.bedNo}</p>
                            <p><strong>Admission Date:</strong> {selectedAdmission.fromDate || selectedAdmission.admissionDate}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Discharge Date *</label>
                                <input
                                    type="date"
                                    name="dischargeDate"
                                    value={dischargeData.dischargeDate}
                                    onChange={handleDischargeChange}
                                    min={selectedAdmission.fromDate || selectedAdmission.admissionDate}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Discharge Type</label>
                                <select
                                    name="dischargeType"
                                    value={dischargeData.dischargeType}
                                    onChange={handleDischargeChange}
                                    style={inputStyle}
                                >
                                    <option value="Recovered">Recovered</option>
                                    <option value="Referred">Referred to Another Hospital</option>
                                    <option value="LAMA">Left Against Medical Advice (LAMA)</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Discharge Notes</label>
                                <textarea
                                    name="dischargeNotes"
                                    value={dischargeData.dischargeNotes}
                                    onChange={handleDischargeChange}
                                    placeholder="Add any discharge notes or instructions..."
                                    rows="3"
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setShowDischargePopup(false)}
                                style={{
                                    background: "linear-gradient(135deg, #6c757d, #5c636a)",
                                    color: "#fff",
                                    padding: "10px 25px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDischargeConfirm}
                                style={{
                                    background: "linear-gradient(135deg, #dc3545, #c82333)",
                                    color: "#fff",
                                    padding: "10px 25px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Confirm Discharge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdmitList;