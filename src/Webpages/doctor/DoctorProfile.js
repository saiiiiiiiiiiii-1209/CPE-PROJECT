import React, { useState, useRef, useEffect } from "react";

// ==================== DOCTOR PROFILE PAGE ====================
// Uses the EXACT SAME CSS classes from ReceptionistDashboard.css
// page-header, add-btn, popup-overlay, popup-card, popup-form-group, etc.

function DoctorProfile() {
    // ==================== DEFAULT DATA ====================
    const defaultDoctorInfo = {
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
    };

    // ==================== STATE ====================
    // Load saved profile from localStorage, or use defaults
    const [doctorInfo, setDoctorInfo] = useState(() => {
        try {
            const saved = localStorage.getItem("doctorProfileInfo");
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load profile:", e);
        }
        return defaultDoctorInfo;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...doctorInfo });

    // ==================== PROFILE PHOTO STATE ====================
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Load profile photo from localStorage on mount
    useEffect(() => {
        const savedPhoto = localStorage.getItem("doctorProfilePhoto");
        if (savedPhoto) {
            setProfilePhoto(savedPhoto);
        }
    }, []);

    // ==================== PHOTO HANDLERS ====================
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            alert("❌ Please select a valid image file (JPEG, PNG, GIF, or WebP).");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("❌ Image size must be less than 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (isEditing) {
                setPhotoPreview(reader.result);
            } else {
                setProfilePhoto(reader.result);
                localStorage.setItem("doctorProfilePhoto", reader.result);
                alert("✅ Profile photo updated successfully!");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        if (isEditing) {
            setPhotoPreview("remove");
        } else {
            setProfilePhoto(null);
            localStorage.removeItem("doctorProfilePhoto");
            alert("✅ Profile photo removed.");
        }
    };

    // ==================== FORM HANDLERS ====================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDoctorInfo(formData);

        // Save profile info to localStorage
        localStorage.setItem("doctorProfileInfo", JSON.stringify(formData));

        // Save photo changes from edit mode
        if (photoPreview === "remove") {
            setProfilePhoto(null);
            localStorage.removeItem("doctorProfilePhoto");
        } else if (photoPreview) {
            setProfilePhoto(photoPreview);
            localStorage.setItem("doctorProfilePhoto", photoPreview);
        }

        setPhotoPreview(null);
        setIsEditing(false);
        alert("✅ Profile updated successfully!");
    };

    const handleCancel = () => {
        setFormData({ ...doctorInfo });
        setPhotoPreview(null);
        setIsEditing(false);
    };

    // Get the currently displayed photo (preview in edit mode, saved otherwise)
    const displayPhoto = isEditing
        ? (photoPreview === "remove" ? null : (photoPreview || profilePhoto))
        : profilePhoto;

    return (
        <div className="appointments-page">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
            />

            {/* ==================== HEADER ==================== */}
            <div className="page-header">
                <div>
                    <h1>👨‍⚕️ My Profile</h1>
                </div>
                {!isEditing && (
                    <button className="add-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            {/* ==================== PROFILE VIEW ==================== */}
            {!isEditing ? (
                <>
                    {/* Profile Header Banner - Same style as dashboard-header */}
                    <div className="dashboard-header" style={{ marginBottom: "30px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            {/* ===== PROFILE PHOTO AVATAR ===== */}
                            <div
                                onClick={handlePhotoClick}
                                title="Click to change profile photo"
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    borderRadius: "50%",
                                    background: displayPhoto
                                        ? `url(${displayPhoto}) center/cover no-repeat`
                                        : "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "34px",
                                    fontWeight: "700",
                                    color: "white",
                                    border: "3px solid rgba(255,255,255,0.4)",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                    flexShrink: 0,
                                }}
                            >
                                {/* Show initial if no photo */}
                                {!displayPhoto && (
                                    <span style={{ userSelect: "none" }}>
                                        {doctorInfo.name.split(" ").slice(1, 2)[0]?.charAt(0) || "D"}
                                    </span>
                                )}
                                {/* Camera overlay on hover */}
                                <div
                                    className="profile-photo-overlay"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.45)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        transition: "opacity 0.25s ease",
                                        borderRadius: "50%",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                                >
                                    <span style={{ fontSize: "22px", marginBottom: "2px" }}>📷</span>
                                    <span style={{ fontSize: "10px", fontWeight: "600", color: "white", letterSpacing: "0.5px" }}>
                                        CHANGE
                                    </span>
                                </div>
                            </div>

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

                        {/* Remove photo button - shown only when photo exists */}
                        {profilePhoto && (
                            <button
                                onClick={handleRemovePhoto}
                                style={{
                                    position: "absolute",
                                    top: "16px",
                                    right: "16px",
                                    background: "rgba(255,255,255,0.15)",
                                    border: "1px solid rgba(255,255,255,0.25)",
                                    color: "rgba(255,255,255,0.9)",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    backdropFilter: "blur(8px)",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.7)";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                                }}
                            >
                                🗑️ Remove Photo
                            </button>
                        )}
                    </div>

                    {/* Detail Sections - Using same card styles */}
                    <div className="table-container" style={{ marginBottom: "24px" }}>
                        <div className="table-header">
                            <h3>📋 Personal Information</h3>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", padding: "10px 0" }}>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Full Name</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.name}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Phone</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.phone}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Email</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.email}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
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
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Specialization</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.specialization}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Department</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.department}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Experience</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.experience}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Join Date</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{new Date(doctorInfo.joinDate).toLocaleDateString()}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>License Number</p>
                                <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500", margin: "0" }}>{doctorInfo.licenseNumber}</p>
                            </div>
                            <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(37,99,235,0.06)" }}>
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

                        {/* ===== PROFILE PHOTO SECTION IN EDIT MODE ===== */}
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#475569", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                            Profile Photo
                        </h3>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                            marginBottom: "28px",
                            padding: "20px",
                            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                            borderRadius: "16px",
                            border: "2px dashed rgba(37,99,235,0.2)",
                        }}>
                            {/* Current / Preview Photo */}
                            <div
                                onClick={handlePhotoClick}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    background: displayPhoto
                                        ? `url(${displayPhoto}) center/cover no-repeat`
                                        : "linear-gradient(135deg, #cbd5e1, #94a3b8)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "36px",
                                    fontWeight: "700",
                                    color: "white",
                                    border: "4px solid white",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    flexShrink: 0,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {!displayPhoto && (
                                    <span style={{ userSelect: "none" }}>
                                        {doctorInfo.name.split(" ").slice(1, 2)[0]?.charAt(0) || "D"}
                                    </span>
                                )}
                                {/* Hover overlay */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.5)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        transition: "opacity 0.25s ease",
                                        borderRadius: "50%",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                                >
                                    <span style={{ fontSize: "24px" }}>📷</span>
                                </div>
                            </div>

                            {/* Upload / Remove Buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                                    Profile Photo
                                </p>
                                <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#64748b" }}>
                                    JPG, PNG, GIF or WebP. Max 5MB.
                                </p>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type="button"
                                        onClick={handlePhotoClick}
                                        style={{
                                            padding: "8px 18px",
                                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            transition: "all 0.2s ease",
                                            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.3)";
                                        }}
                                    >
                                        📤 Upload Photo
                                    </button>

                                    {(displayPhoto) && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            style={{
                                                padding: "8px 18px",
                                                background: "white",
                                                color: "#ef4444",
                                                border: "2px solid #fecaca",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                transition: "all 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#fef2f2";
                                                e.currentTarget.style.borderColor = "#ef4444";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "white";
                                                e.currentTarget.style.borderColor = "#fecaca";
                                            }}
                                        >
                                            🗑️ Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

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
