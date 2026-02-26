import React, { useState, useRef } from "react";

// ==================== DOCTOR PROFILE PAGE ====================
// Uses the EXACT SAME CSS classes from ReceptionistDashboard.css
// page-header, add-btn, popup-overlay, popup-card, popup-form-group, etc.
// Added: Profile photo upload with preview

function DoctorProfile() {
    // ==================== STATE ====================
    const [doctorInfo, setDoctorInfo] = useState({
        name: "Dr. Pranjal Patil",
        specialization: "Cardiology",
        department: "Cardiology",
        phone: "9876543210",
        email: "pranjal.patil@hospital.com",
        address: "123 Medical Center, Nashik, Maharashtra",
        experience: "8 years",
        licenseNumber: "MH123456789",
        qualifications: "MBBS, MD Cardiology",
        joinDate: "2016-03-15",
        profilePhoto: null,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...doctorInfo });
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // ==================== HANDLERS ====================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("❌ Please select an image file (JPG, PNG, etc.)");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("❌ Image size must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setFormData(prev => ({ ...prev, profilePhoto: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDoctorInfo(formData);
        setIsEditing(false);
        alert("✅ Profile updated successfully!");
    };

    const handleCancel = () => {
        setFormData({ ...doctorInfo });
        setPhotoPreview(doctorInfo.profilePhoto);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setFormData({ ...doctorInfo });
        setPhotoPreview(doctorInfo.profilePhoto);
        setIsEditing(true);
    };

    // Get the current profile photo to display
    const currentPhoto = doctorInfo.profilePhoto;

    return (
        <div className="appointments-page">
            {/* ==================== HEADER ==================== */}
            <div className="page-header">
                <div>
                    <h1>👨‍⚕️ My Profile</h1>
                </div>
                {!isEditing && (
                    <button className="add-btn" onClick={handleEditClick}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            {/* ==================== PROFILE VIEW ==================== */}
            {!isEditing ? (
                <>
                    {/* Profile Header Banner */}
                    <div className="dashboard-header" style={{ marginBottom: "30px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            {/* Profile Photo or Initials */}
                            {currentPhoto ? (
                                <img
                                    src={currentPhoto}
                                    alt="Profile"
                                    style={{
                                        width: "80px", height: "80px", borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "3px solid rgba(255,255,255,0.4)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "50%",
                                    background: "rgba(255,255,255,0.2)", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: "32px", fontWeight: "700", color: "white",
                                    border: "3px solid rgba(255,255,255,0.3)"
                                }}>
                                    {doctorInfo.name.split(" ").slice(1, 2)[0]?.charAt(0) || "D"}
                                </div>
                            )}
                            <div>
                                <h1 style={{ color: "white", fontSize: "24px", margin: "0 0 4px" }}>{doctorInfo.name}</h1>
                                <p style={{ color: "rgba(255,255,255,0.9)", margin: "0 0 4px", fontSize: "16px", fontWeight: "600" }}>
                                    {doctorInfo.specialization}
                                </p>
                                <p style={{ color: "rgba(255,255,255,0.7)", margin: "0", fontSize: "14px" }}>
                                    {doctorInfo.department} Department
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detail Sections */}
                    <div className="table-container" style={{ marginBottom: "24px" }}>
                        <div className="table-header">
                            <h3>📋 Personal Information</h3>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", padding: "10px 0" }}>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Full Name</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.name}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Phone</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.phone}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Email</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.email}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Address</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-header">
                            <h3>🏥 Professional Information</h3>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", padding: "10px 0" }}>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Specialization</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.specialization}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Department</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.department}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Experience</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.experience}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Join Date</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{new Date(doctorInfo.joinDate).toLocaleDateString()}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>License Number</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.licenseNumber}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Qualifications</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.qualifications}</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* ==================== EDIT MODE ==================== */
                <div className="popup-card wide-popup" style={{ maxWidth: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                    <h2>✏️ Edit Profile</h2>
                    <form onSubmit={handleSubmit}>

                        {/* ==================== PROFILE PHOTO SECTION ==================== */}
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#475569", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>📷 Profile Photo</h3>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "24px",
                            marginBottom: "24px", padding: "20px",
                            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px"
                        }}>
                            {/* Photo Preview */}
                            <div style={{ position: "relative" }}>
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Profile Preview"
                                        style={{
                                            width: "100px", height: "100px", borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "3px solid #1976d2",
                                            boxShadow: "0 4px 12px rgba(25,118,210,0.2)"
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "100px", height: "100px", borderRadius: "50%",
                                        background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "36px", fontWeight: "700", color: "white",
                                        border: "3px solid #e2e8f0",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}>
                                        {formData.name.split(" ").slice(1, 2)[0]?.charAt(0) || "D"}
                                    </div>
                                )}
                            </div>

                            {/* Upload Controls */}
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                                    Upload Profile Photo
                                </p>
                                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b" }}>
                                    JPG, PNG or GIF. Max 5MB. Recommended: 200×200px
                                </p>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                        style={{ display: "none" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            padding: "8px 20px",
                                            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                                            color: "white", border: "none", borderRadius: "4px",
                                            fontSize: "13px", fontWeight: "600", cursor: "pointer",
                                            transition: "all 0.3s ease"
                                        }}
                                    >
                                        📁 Choose Photo
                                    </button>
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            style={{
                                                padding: "8px 20px",
                                                background: "#fee2e2", color: "#c62828",
                                                border: "1px solid #fecaca", borderRadius: "4px",
                                                fontSize: "13px", fontWeight: "600", cursor: "pointer",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            🗑️ Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ==================== PERSONAL INFO ==================== */}
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#475569", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Personal Information</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                            <div className="popup-form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* ==================== PROFESSIONAL INFO ==================== */}
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#475569", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Professional Information</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                            <div className="popup-form-group">
                                <label>Specialization</label>
                                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Experience</label>
                                <input type="text" name="experience" value={formData.experience} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>License Number</label>
                                <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Qualifications</label>
                                <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} required />
                            </div>
                            <div className="popup-form-group">
                                <label>Join Date</label>
                                <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="popup-actions">
                            <button type="button" className="cancel" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="confirm">✅ Save Changes</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default DoctorProfile;
