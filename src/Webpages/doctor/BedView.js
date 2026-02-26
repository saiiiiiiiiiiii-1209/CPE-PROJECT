import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./BedView.css";

const BedView = ({ totalBeds = 20 }) => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const contextAdmissions = context?.admissions || [];
  const [flippedBeds, setFlippedBeds] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [apiAdmissions, setApiAdmissions] = useState([]);

  // Fetch admissions from backend API
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/admitpatient');
        const data = await response.json();
        if (data.success) {
          setApiAdmissions(data.data);
          console.log("🛏️ BedView fetched API admissions:", data.data);
        }
      } catch (error) {
        console.error("❌ BedView API fetch failed, using context only:", error);
      }
    };
    fetchAdmissions();
  }, []);

  // Merge API admissions + context admissions (API takes priority, avoid duplicates)
  const admissions = (() => {
    const merged = [...apiAdmissions];
    const apiIds = new Set(apiAdmissions.map(a => String(a.id)));
    const apiBeds = new Set(apiAdmissions.filter(a => a.status === "Admitted").map(a => a.bedNo));
    contextAdmissions.forEach(ca => {
      if (!apiIds.has(String(ca.id)) && !apiBeds.has(ca.bedNo)) {
        merged.push(ca);
      }
    });
    return merged;
  })();

  // Log admissions for debugging
  useEffect(() => {
    console.log("🛏️ BedView total admissions:", admissions.length, admissions);
  }, [admissions]);

  const bedNumbers = Array.from({ length: totalBeds }, (_, i) => `B${i + 1}`);

  // Helper to check if admission is active (Admitted status and not discharged)
  const isActiveAdmission = (admission) => {
    // Only consider as active if status is "Admitted"
    if (admission.status !== "Admitted") return false;

    // If no toDate, it's active
    if (!admission.toDate) return true;

    // Check if discharge date is in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dischargeDate = new Date(admission.toDate);
    dischargeDate.setHours(0, 0, 0, 0);
    return dischargeDate >= today;
  };

  // Get only active (admitted) patients for bed occupancy
  const occupiedBeds = admissions.reduce((map, admission) => {
    if (isActiveAdmission(admission)) {
      map[admission.bedNo] = admission;
    }
    return map;
  }, {});

  // Filter beds based on search term
  const filteredBedNumbers = bedNumbers.filter(bedNo => {
    if (!searchTerm) return true;
    const admission = occupiedBeds[bedNo];
    const patientName = admission ? admission.patientName.toLowerCase() : "";
    return bedNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.includes(searchTerm.toLowerCase());
  });

  const availableCount = bedNumbers.filter(bed => !occupiedBeds[bed]).length;
  const occupiedCount = bedNumbers.length - availableCount;

  const handleCardClick = (bedNo) => {
    setFlippedBeds(prev => ({
      ...prev,
      [bedNo]: !prev[bedNo]
    }));
  };

  const handleBackToDashboard = () => {
    navigate("/receptionist-dashboard");
  };

  return (
    <div className="bed-view-container">
      <div className="bed-view-header">
        <h2 className="bed-view-title">
          <i className="fas fa-bed" style={{ marginRight: '10px' }}></i>
          Bed Occupancy Overview
        </h2>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div className="bed-stats">
            <div className="stat-item available">
              <i className="fas fa-bed" style={{ color: '#2e7d32' }}></i>
              <span>Available: {availableCount}</span>
            </div>
            <div className="stat-item occupied">
              <i className="fas fa-bed" style={{ color: '#c62828' }}></i>
              <span>Occupied: {occupiedCount}</span>
            </div>
          </div>
          <button
            className="back-to-dashboard-btn"
            onClick={handleBackToDashboard}
            style={{
              background: "linear-gradient(135deg, #1b44d6, #1e74ca)",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(108,117,125,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "none";
            }}
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="search-container-fluid">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Search by bed number or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm("")}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="bed-grid">
        {filteredBedNumbers.map(bedNo => {
          const admission = occupiedBeds[bedNo];
          const isOccupied = !!admission;
          const isFlipped = flippedBeds[bedNo] || false;

          return (
            <div
              key={bedNo}
              className={`bed-card ${isOccupied ? 'occupied' : 'available'} ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(bedNo)}
              title={isOccupied ? `Patient: ${admission.patientName}` : 'Available bed'}
            >
              <div className="bed-card-inner">
                <div className="bed-card-front">
                  <div className="bed-icon">
                    <i className={`fas fa-bed ${isOccupied ? 'occupied-icon' : 'available-icon'}`}></i>
                  </div>
                  <div className="bed-number">{bedNo}</div>
                  <div className={`bed-status ${isOccupied ? 'occupied' : 'available'}`}>
                    {isOccupied ? 'Occupied' : 'Available'}
                  </div>
                </div>
                <div className="bed-card-back">
                  {isOccupied ? (
                    <div className="patient-details">
                      <h4>{admission.patientName}</h4>
                      <p><i className="fas fa-calendar-alt"></i> <strong>Age:</strong> {admission.age}</p>
                      <p><i className="fas fa-venus-mars"></i> <strong>Gender:</strong> {admission.gender}</p>
                      <p><i className="fas fa-calendar-check"></i> <strong>Admitted:</strong> {admission.fromDate || admission.admissionDate}</p>
                      {admission.symptoms?.length > 0 && (
                        <p><i className="fas fa-stethoscope"></i> <strong>Symptoms:</strong> {admission.symptoms.slice(0, 2).join(', ')}{admission.symptoms.length > 2 ? '…' : ''}</p>
                      )}
                      {admission.admittingDoctor && (
                        <p><i className="fas fa-user-md"></i> <strong>Dr.</strong> {admission.admittingDoctor}</p>
                      )}
                    </div>
                  ) : (
                    <div className="available-message">
                      <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#2e7d32', marginBottom: '10px' }}></i>
                      <p>✨ Available for admit patient</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBedNumbers.length === 0 && (
        <div className="no-results">
          <i className="fas fa-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <h3>No beds match your search</h3>
          <p>Try a different keyword or clear the search.</p>
        </div>
      )}
    </div>
  );
};

export default BedView;