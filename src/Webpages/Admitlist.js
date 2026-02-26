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
    const [loading, setLoading] = useState(true);

    // Fetch admissions from backend
    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8001/api/admitpatient');
            const data = await response.json();
            if (data.success) {
                setAdmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching admissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8001/api/admissionstats');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchAdmissions();
        fetchStats();
    }, []);

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
        
        if (name === "phone" || name === "kinContact") {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 10) {
                setEditFormData(prev => ({ ...prev, [name]: cleaned }));
            }
        } 
        else if (name === "age") {
            if (value === "" || /^\d+$/.test(value)) {
                const ageNum = parseInt(value);
                if (value === "" || (ageNum >= 0 && ageNum <= 120)) {
                    setEditFormData(prev => ({ ...prev, [name]: value }));
                }
            }
        } 
        else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`http://localhost:8001/api/admitpatient/${selectedAdmission.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchAdmissions();
                await fetchStats();
                setShowEditPopup(false);
                setEditErrors({});
                alert(`✅ Admission record updated successfully!`);
            } else {
                alert(`❌ Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating admission:', error);
            alert('Failed to update admission');
        }
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

    const handleDischargeConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:8001/api/dischargepatient/${selectedAdmission.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dischargeData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchAdmissions();
                await fetchStats();
                setShowDischargePopup(false);
                alert(`✅ Patient ${selectedAdmission.patientName} discharged successfully!`);
            } else {
                alert(`❌ Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error discharging patient:', error);
            alert('Failed to discharge patient');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this admission record?")) {
            try {
                const response = await fetch(`http://localhost:8001/api/admitpatient/${id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    await fetchAdmissions();
                    await fetchStats();
                    alert('✅ Admission record deleted successfully!');
                } else {
                    alert(`❌ Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error deleting admission:', error);
                alert('Failed to delete admission');
            }
        }
    };

    const handleStatusChange = (id, newStatus) => {
        if (newStatus === "Discharged") {
            const admission = admissions.find(adm => adm.id === id);
            if (admission) {
                handleDischarge(admission);
            }
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner"></div>
                <p>Loading admissions...</p>
            </div>
        );
    }

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
                                            style={{
                                                padding: "5px 10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                backgroundColor: admission.status === "Admitted" ? "#d4edda" : "#f8d7da",
                                                color: admission.status === "Admitted" ? "#155724" : "#721c24",
                                            }}
                                        >
                                            <option value="Admitted">Admitted</option>
                                            <option value="Discharged">Discharged</option>
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
                                    {searchTerm ? `No admissions found matching "${searchTerm}"` : "No admissions found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* VIEW POPUP - Keep as is from your original code */}
            {showViewPopup && selectedAdmission && (
                // ... your existing view popup code
                <div>View Popup Content</div>
            )}

            {/* EDIT POPUP - Keep as is from your original code */}
            {showEditPopup && selectedAdmission && (
                // ... your existing edit popup code
                <div>Edit Popup Content</div>
            )}

            {/* DISCHARGE POPUP - Keep as is from your original code */}
            {showDischargePopup && selectedAdmission && (
                // ... your existing discharge popup code
                <div>Discharge Popup Content</div>
            )}
        </div>
    );
}

export default AdmitList;