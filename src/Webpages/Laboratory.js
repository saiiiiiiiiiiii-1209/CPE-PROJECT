import React, { useState, useEffect } from "react";
import "./Laboratory.css";
import "./Appointment";
import "./Patientlist"

function Laboratory() {
  // ==================== STATE ====================
  const [appointments, setAppointments] = useState([]);
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [laboratoryPatients, setLaboratoryPatients] = useState({
    "2D-Echocardiogram": [],
    "Electrocardiogram": [],
    "Treadmill Test": []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showTestPopup, setShowTestPopup] = useState(false);
  const [showPatientListPopup, setShowPatientListPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedTestForList, setSelectedTestForList] = useState(null);
  const [selectedReportPatient, setSelectedReportPatient] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState("2D-Echocardiogram");
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0
  });
  const [loading, setLoading] = useState(false);

  // ==================== HELPER FUNCTIONS FOR SYMPTOMS ====================
  const formatSymptoms = (symptoms) => {
    if (!symptoms) return 'No symptoms';
    
    if (Array.isArray(symptoms)) {
      const text = symptoms.join(', ');
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    
    if (typeof symptoms === 'string') {
      return symptoms.length > 30 ? symptoms.substring(0, 30) + '...' : symptoms;
    }
    
    return 'Symptoms not specified';
  };

  const formatSymptomsFull = (symptoms) => {
    if (!symptoms) return 'No symptoms';
    
    if (Array.isArray(symptoms)) {
      return symptoms.join(', ');
    }
    
    if (typeof symptoms === 'string') {
      return symptoms;
    }
    
    return 'Symptoms not specified';
  };

  // ==================== LOAD DATA FROM MONGODB ====================
  useEffect(() => {
    fetchLaboratoryData();
    loadLocalData();
  }, []);

  const fetchLaboratoryData = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching laboratory data from MongoDB...");
      const response = await fetch('http://localhost:8001/api/laboratory');
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Laboratory data fetched:", data);
        setLaboratoryPatients(data.groupedByTest);
        setStats(data.stats);
      } else {
        console.error("❌ Failed to fetch lab data:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching lab data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    // Load registered patients from localStorage as backup
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
      setRegisteredPatients(JSON.parse(savedPatients));
    }

    // Load today's appointments from localStorage
    const today = new Date().toISOString().split('T')[0];
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    const todaysAppointments = allAppointments.filter(apt => {
      const aptDate = apt.date ? apt.date.split('T')[0] : apt.date;
      return aptDate === today;
    });

    setAppointments(todaysAppointments);
  };

  // ==================== CALCULATE STATS ====================
  const calculateStats = (data) => {
    const allPatients = [
      ...data["2D-Echocardiogram"],
      ...data["Electrocardiogram"],
      ...data["Treadmill Test"]
    ];

    const total = allPatients.length;
    const male = allPatients.filter(p => p.gender === "Male").length;
    const female = allPatients.filter(p => p.gender === "Female").length;

    setStats({ total, male, female });
  };

  // ==================== HANDLE PATIENT CLICK ====================
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowTestPopup(true);
  };

  // ==================== HANDLE TEST SELECTION (SAVE TO MONGODB) ====================
  const handleTestSelect = async (testName) => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      console.log("🔵 Adding patient to test:", testName);
      console.log("🔵 Patient data:", selectedPatient);

      // Format symptoms properly
      let symptomsString = '';
      if (Array.isArray(selectedPatient.symptoms)) {
        symptomsString = selectedPatient.symptoms.join(', ');
      } else if (typeof selectedPatient.symptoms === 'string') {
        symptomsString = selectedPatient.symptoms;
      }

      const labPatient = {
        patientName: selectedPatient.patientName,
        age: parseInt(selectedPatient.age),
        gender: selectedPatient.gender,
        phone: selectedPatient.phone,
        email: selectedPatient.email || '',
        bloodGroup: selectedPatient.bloodGroup || '',
        symptoms: symptomsString,
        testName: testName,
        status: "Pending",
        sourceId: selectedPatient.id || selectedPatient._id,
        sourceType: selectedPatient.sourceType || 'appointment'
      };

      console.log("📤 Sending to MongoDB:", labPatient);

      const response = await fetch('http://localhost:8001/api/laboratory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labPatient)
      });

      const data = await response.json();
      console.log("📥 Response from MongoDB:", data);

      if (data.success) {
        // Refresh laboratory data from MongoDB
        await fetchLaboratoryData();
        
        // Remove from appointments if it was an appointment
        if (selectedPatient.sourceType === 'appointment' || !selectedPatient.sourceType) {
          setAppointments(prev => prev.filter(apt => apt.id !== selectedPatient.id));
        }

        alert(`✅ Patient added to ${testName} successfully!`);
        setShowTestPopup(false);
        setSelectedPatient(null);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("🔴 Error adding to laboratory:", error);
      alert('Failed to add patient to laboratory');
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE TEST BUTTON CLICK (SHOW FOLDER) ====================
  const handleTestButtonClick = async (testName) => {
    setSelectedTestForList(testName);
    setShowPatientListPopup(true);
    
    // Fetch latest data for this test from MongoDB
    try {
      const response = await fetch(`http://localhost:8001/api/laboratory/test/${testName}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testName} patients:`, data.data);
        setLaboratoryPatients(prev => ({
          ...prev,
          [testName]: data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching test patients:', error);
    }
  };

  // ==================== HANDLE PATIENT CARD CLICK (SHOW REPORT) ====================
  const handlePatientCardClick = (patient) => {
    setSelectedReportPatient(patient);
    setSelectedTestType(patient.testName || "2D-Echocardiogram");
    setShowReportPopup(true);
  };

  // ==================== GENERATE RANDOM NORMAL VALUES ====================
  const generateNormalValues = () => {
    return {
      ejectionFraction: Math.floor(Math.random() * (70 - 55 + 1)) + 55,
      lvedd: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1),
      lvesd: (Math.random() * (3.5 - 2.8) + 2.8).toFixed(1),
      la: (Math.random() * (4.0 - 3.2) + 3.2).toFixed(1),
      aorticRoot: (Math.random() * (3.2 - 2.5) + 2.5).toFixed(1),
      ivs: (Math.random() * (1.0 - 0.7) + 0.7).toFixed(1),
      lvpw: (Math.random() * (1.0 - 0.7) + 0.7).toFixed(1),
      mitralE: (Math.random() * (0.9 - 0.7) + 0.7).toFixed(2),
      mitralA: (Math.random() * (0.6 - 0.4) + 0.4).toFixed(2),
      eARatio: ((Math.random() * (1.5 - 1.0) + 1.0)).toFixed(1),
      aorticVelocity: (Math.random() * (1.5 - 1.0) + 1.0).toFixed(1),
      tricuspidRegurge: ["Trivial", "Mild", "None"][Math.floor(Math.random() * 3)],
      mitralRegurge: ["None", "Trivial", "Mild"][Math.floor(Math.random() * 3)],
      aorticRegurge: ["None", "Trivial"][Math.floor(Math.random() * 2)],
      pericardium: ["No effusion", "Normal"][Math.floor(Math.random() * 2)],
      heartRate: Math.floor(Math.random() * (80 - 60 + 1)) + 60,
      qtInterval: Math.floor(Math.random() * (420 - 380 + 1)) + 380,
      prInterval: Math.floor(Math.random() * (200 - 120 + 1)) + 120,
      qrsDuration: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
      exerciseDuration: (Math.random() * (12 - 8) + 8).toFixed(1),
      maxHeartRate: Math.floor(Math.random() * (160 - 140 + 1)) + 140,
      bloodPressure: `${Math.floor(Math.random() * (130 - 110 + 1)) + 110}/${Math.floor(Math.random() * (80 - 70 + 1)) + 70}`,
      metabolicEquivalents: (Math.random() * (12 - 8) + 8).toFixed(1)
    };
  };

  // ==================== FORMAT DATE ====================
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // ==================== FILTER APPOINTMENTS ====================
  const filteredAppointments = appointments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.phone?.includes(searchTerm)
  );

  // ==================== FILTER REGISTERED PATIENTS ====================
  const filteredRegisteredPatients = registeredPatients.filter(patient =>
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  // ==================== TEST CONFIGURATION ====================
  const tests = [
    {
      id: "2D-Echocardiogram",
      name: "2D-Echocardiogram",
      icon: "📊",
      color: "#667eea",
      lightColor: "#e6edff",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
      description: "Heart ultrasound imaging"
    },
    {
      id: "Electrocardiogram",
      name: "Electrocardiogram",
      icon: "📈",
      color: "#f093fb",
      lightColor: "#fef0ff",
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
      description: "Heart electrical activity"
    },
    {
      id: "Treadmill Test",
      name: "Treadmill Test",
      icon: "🏃",
      color: "#4facfe",
      lightColor: "#e6f2ff",
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
      description: "Stress test on treadmill"
    }
  ];

  // ==================== GET REPORT TITLE AND ICON ====================
  const getReportDetails = (testType) => {
    switch(testType) {
      case "2D-Echocardiogram":
        return {
          title: "2D-ECHOCARDIOGRAM REPORT",
          icon: "📊",
          department: "Echocardiography Department"
        };
      case "Electrocardiogram":
        return {
          title: "ELECTROCARDIOGRAM (ECG) REPORT",
          icon: "📈",
          department: "Cardiology - ECG Department"
        };
      case "Treadmill Test":
        return {
          title: "TREADMILL TEST (TMT) REPORT",
          icon: "🏃",
          department: "Stress Testing Laboratory"
        };
      default:
        return {
          title: "MEDICAL REPORT",
          icon: "📋",
          department: "Laboratory Department"
        };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
        <p>Loading laboratory data...</p>
      </div>
    );
  }

  return (
    <div className="laboratory-page">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <h1>🔬 Laboratory Management</h1>
        <p className="page-subtitle">Manage patient laboratory tests</p>
      </div>

      {/* ==================== STATISTICS CARDS ==================== */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Lab Patients</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨</div>
          <div className="stat-info">
            <span className="stat-label">Male</span>
            <span className="stat-value">{stats.male}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👩</div>
          <div className="stat-info">
            <span className="stat-label">Female</span>
            <span className="stat-value">{stats.female}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-label">Registered</span>
            <span className="stat-value">{registeredPatients.length}</span>
          </div>
        </div>
      </div>

      {/* ==================== THREE TEST FOLDERS ==================== */}
      <div className="lab-tests-section">
        <h2>📁 Laboratory Test Folders</h2>
        <div className="test-buttons-row">
          {tests.map((test) => (
            <div
              key={test.id}
              className="test-button-card"
              onClick={() => handleTestButtonClick(test.id)}
              style={{ borderColor: test.color, backgroundColor: test.lightColor }}
            >
              <div className="test-icon" style={{ background: test.gradient }}>
                {test.icon}
              </div>
              <div className="test-info">
                <h3>{test.name}</h3>
                <p>{test.description}</p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  {laboratoryPatients[test.id]?.length || 0} patients
                </div>
              </div>
              <div className="test-count" style={{ background: test.color }}>
                {laboratoryPatients[test.id]?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== TODAY'S APPOINTMENTS SECTION ==================== */}
      <div className="today-appointments-section">
        <div className="section-header">
          <h2>📋 Today's Appointments</h2>
          <span className="badge">{appointments.length} waiting</span>
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>

        {/* Patient List */}
        <div className="patient-list">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((patient) => (
              <div
                key={patient.id}
                className="patient-item"
                onClick={() => handlePatientClick({...patient, sourceType: 'appointment'})}
              >
                <div className="patient-info">
                  <strong>{patient.patientName}</strong>
                  <span>{patient.age}y / {patient.gender} • {patient.phone} • {patient.time}</span>
                </div>
                <button className="assign-btn">Assign Test</button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔬</span>
              <p>No patients waiting</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== REGISTERED PATIENTS SECTION ==================== */}
      <div className="registered-patients-section">
        <div className="section-header">
          <h2>📋 Registered Patients</h2>
          <span className="badge">{registeredPatients.length} total</span>
        </div>

        {/* Patient List */}
        <div className="patient-list">
          {filteredRegisteredPatients.length > 0 ? (
            filteredRegisteredPatients.slice(0, 5).map((patient) => (
              <div
                key={patient.id}
                className="patient-item"
                onClick={() => handlePatientClick({...patient, sourceType: 'patient'})}
              >
                <div className="patient-info">
                  <strong>{patient.patientName}</strong>
                  <span>{patient.age}y / {patient.gender} • {patient.phone} • {patient.bloodGroup || "No BG"}</span>
                </div>
                <button className="assign-btn">Assign Test</button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>No registered patients</p>
            </div>
          )}
          {registeredPatients.length > 5 && (
            <div className="view-more">
              <button className="view-more-btn">View All {registeredPatients.length} Patients →</button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== TEST SELECTION POPUP ==================== */}
      {showTestPopup && selectedPatient && (
        <div className="popup-overlay" onClick={() => setShowTestPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>🧪 Select Test for {selectedPatient.patientName}</h3>
              <button className="close-btn" onClick={() => setShowTestPopup(false)}>×</button>
            </div>

            <div className="popup-content">
              <div className="patient-summary">
                <p><strong>Age:</strong> {selectedPatient.age} | <strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone} | <strong>Blood Group:</strong> {selectedPatient.bloodGroup || "-"}</p>
                <p><strong>Symptoms:</strong> {formatSymptomsFull(selectedPatient.symptoms)}</p>
              </div>

              <div className="test-options">
                {tests.map((test) => (
                  <button
                    key={test.id}
                    className="test-option"
                    style={{ borderColor: test.color }}
                    onClick={() => handleTestSelect(test.id)}
                  >
                    <span className="test-option-icon" style={{ background: test.gradient }}>
                      {test.icon}
                    </span>
                    <span className="test-option-name">{test.name}</span>
                    <span className="test-option-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PATIENT LIST POPUP (TEST FOLDER VIEW) ==================== */}
      {showPatientListPopup && selectedTestForList && (
        <div className="popup-overlay" onClick={() => setShowPatientListPopup(false)}>
          <div className="popup-card large-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header" style={{ background: tests.find(t => t.id === selectedTestForList)?.gradient }}>
              <h3>
                {tests.find(t => t.id === selectedTestForList)?.icon} {selectedTestForList} Folder
                <span className="header-count">({laboratoryPatients[selectedTestForList]?.length || 0} patients)</span>
              </h3>
              <button className="close-btn" onClick={() => setShowPatientListPopup(false)}>×</button>
            </div>

            <div className="popup-content">
              {laboratoryPatients[selectedTestForList]?.length > 0 ? (
                <div className="patient-grid-2col">
                  {laboratoryPatients[selectedTestForList].map((patient, index) => (
                    <div
                      key={patient._id || patient.testId || index}
                      className="patient-card-modern clickable"
                      onClick={() => handlePatientCardClick(patient)}
                    >
                      <div className="patient-card-header">
                        <div className="patient-avatar-large">
                          {patient.gender === "Male" ? "👨" : "👩"}
                        </div>
                        <div className="patient-name-section">
                          <h4>{patient.patientName}</h4>
                          <span className="patient-age-gender">{patient.age}y • {patient.gender}</span>
                        </div>
                      </div>
                      <div className="patient-card-body">
                        <div className="info-row">
                          <span className="info-icon">📞</span>
                          <span className="info-text">{patient.phone}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-icon">⏰</span>
                          <span className="info-text">{patient.testTime || patient.time || "-"}</span>
                        </div>
                        {patient.symptoms && (
                          <div className="info-row">
                            <span className="info-icon">🩺</span>
                            <span className="info-text">{formatSymptoms(patient.symptoms)}</span>
                          </div>
                        )}
                      </div>
                      <div className="patient-card-footer">
                        <span className="click-hint">Click to view report →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No patients in {selectedTestForList} folder</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PATIENT REPORT POPUP ==================== */}
      {showReportPopup && selectedReportPatient && (
        <div className="popup-overlay" onClick={() => setShowReportPopup(false)}>
          <div className="popup-card report-popup" onClick={(e) => e.stopPropagation()}>
            <div className="report-header" style={{ 
              background: selectedTestType === "2D-Echocardiogram" ? "linear-gradient(135deg, #1e2b4a, #2a3b5c)" :
                          selectedTestType === "Electrocardiogram" ? "linear-gradient(135deg, #6b21a8, #86198f)" :
                          "linear-gradient(135deg, #0e7490, #0891b2)"
            }}>
              <div className="header-top">
                <div className="hospital-info">
                  <h2 style={{color:"white"}}>🏥 Medi Care Clinic</h2>
                  <p>{getReportDetails(selectedTestType).department}</p>
                </div>
                <button className="close-btn" onClick={() => setShowReportPopup(false)}>×</button>
              </div>
              <div className="report-title">
                <span className="title-icon">{getReportDetails(selectedTestType).icon}</span>
                <h1>{getReportDetails(selectedTestType).title}</h1>
                <span className="report-id">#{selectedReportPatient.testId?.slice(-6) || selectedReportPatient._id?.slice(-6) || "000000"}</span>
              </div>
            </div>

            <div className="report-body">
              {/* Patient Information Card */}
              <div className="patient-info-card">
                <div className="card-header">
                  <span className="header-icon">👤</span>
                  <h3>PATIENT DETAILS</h3>
                </div>
                <div className="patient-details-grid">
                  <div className="detail-group">
                    <label>Patient Name</label>
                    <div className="detail-value highlight">
                      <span className="value-icon">📝</span>
                      {selectedReportPatient.patientName}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label>Phone Number</label>
                    <div className="detail-value">
                      <span className="value-icon">📞</span>
                      {selectedReportPatient.phone}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label>Age / Gender</label>
                    <div className="detail-value">
                      <span className="value-icon">⚥</span>
                      {selectedReportPatient.age} years / {selectedReportPatient.gender}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label>Test Date & Time</label>
                    <div className="detail-value">
                      <span className="value-icon">⏰</span>
                      {formatDate(selectedReportPatient.testDate || selectedReportPatient.date)} at {selectedReportPatient.testTime || selectedReportPatient.time}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label>Blood Group</label>
                    <div className="detail-value">
                      <span className="value-icon">🩸</span>
                      {selectedReportPatient.bloodGroup || "Not Specified"}
                    </div>
                  </div>
                  {selectedReportPatient.symptoms && (
                    <div className="detail-group full-width">
                      <label>Presenting Symptoms</label>
                      <div className="detail-value symptoms-box">
                        <span className="value-icon">🩺</span>
                        {formatSymptomsFull(selectedReportPatient.symptoms)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results Section */}
              {selectedTestType === "2D-Echocardiogram" && (
                <div className="test-results-card">
                  <div className="card-header">
                    <span className="header-icon">📊</span>
                    <h3>2D-ECHOCARDIOGRAM RESULTS</h3>
                  </div>
                  <div className="results-grid">
                    <div className="result-item">
                      <label>Ejection Fraction (EF)</label>
                      <div className="result-value">{generateNormalValues().ejectionFraction}%</div>
                    </div>
                    <div className="result-item">
                      <label>LVEDD</label>
                      <div className="result-value">{generateNormalValues().lvedd} cm</div>
                    </div>
                    <div className="result-item">
                      <label>LVESD</label>
                      <div className="result-value">{generateNormalValues().lvesd} cm</div>
                    </div>
                    <div className="result-item">
                      <label>Left Atrium (LA)</label>
                      <div className="result-value">{generateNormalValues().la} cm</div>
                    </div>
                    <div className="result-item">
                      <label>Aortic Root</label>
                      <div className="result-value">{generateNormalValues().aorticRoot} cm</div>
                    </div>
                    <div className="result-item">
                      <label>IVS</label>
                      <div className="result-value">{generateNormalValues().ivs} cm</div>
                    </div>
                    <div className="result-item">
                      <label>LVPW</label>
                      <div className="result-value">{generateNormalValues().lvpw} cm</div>
                    </div>
                    <div className="result-item">
                      <label>Mitral E/A Ratio</label>
                      <div className="result-value">{generateNormalValues().eARatio}</div>
                    </div>
                    <div className="result-item">
                      <label>Tricuspid Regurgitation</label>
                      <div className="result-value">{generateNormalValues().tricuspidRegurge}</div>
                    </div>
                    <div className="result-item">
                      <label>Mitral Regurgitation</label>
                      <div className="result-value">{generateNormalValues().mitralRegurge}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTestType === "Electrocardiogram" && (
                <div className="test-results-card">
                  <div className="card-header">
                    <span className="header-icon">📈</span>
                    <h3>ECG RESULTS</h3>
                  </div>
                  <div className="results-grid">
                    <div className="result-item">
                      <label>Heart Rate</label>
                      <div className="result-value">{generateNormalValues().heartRate} bpm</div>
                    </div>
                    <div className="result-item">
                      <label>QT Interval</label>
                      <div className="result-value">{generateNormalValues().qtInterval} ms</div>
                    </div>
                    <div className="result-item">
                      <label>PR Interval</label>
                      <div className="result-value">{generateNormalValues().prInterval} ms</div>
                    </div>
                    <div className="result-item">
                      <label>QRS Duration</label>
                      <div className="result-value">{generateNormalValues().qrsDuration} ms</div>
                    </div>
                    <div className="result-item full-width">
                      <label>Interpretation</label>
                      <div className="result-value">Normal Sinus Rhythm</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTestType === "Treadmill Test" && (
                <div className="test-results-card">
                  <div className="card-header">
                    <span className="header-icon">🏃</span>
                    <h3>TMT RESULTS</h3>
                  </div>
                  <div className="results-grid">
                    <div className="result-item">
                      <label>Exercise Duration</label>
                      <div className="result-value">{generateNormalValues().exerciseDuration} min</div>
                    </div>
                    <div className="result-item">
                      <label>Max Heart Rate</label>
                      <div className="result-value">{generateNormalValues().maxHeartRate} bpm</div>
                    </div>
                    <div className="result-item">
                      <label>Blood Pressure</label>
                      <div className="result-value">{generateNormalValues().bloodPressure} mmHg</div>
                    </div>
                    <div className="result-item">
                      <label>METS</label>
                      <div className="result-value">{generateNormalValues().metabolicEquivalents}</div>
                    </div>
                    <div className="result-item full-width">
                      <label>Interpretation</label>
                      <div className="result-value">Negative for Ischemia, Good Functional Capacity</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="report-footer-modern">
                <div className="doctor-signature">
                  <div className="signature-line"></div>
                  <span className="doctor-name">Dr. Pranjal Patil</span>
                  <span className="doctor-title">Consultant Cardiologist</span>
                </div>
                <div className="report-date-modern">
                  <span className="date-icon">📅</span>
                  {new Date().toLocaleDateString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laboratory;