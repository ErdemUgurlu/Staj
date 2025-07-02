import React, { useState } from 'react';
import './RadarDisplay.css';

const RadarDisplay = ({ broadcasts = [], onBroadcastUpdated }) => {
  const [hoveredBroadcast, setHoveredBroadcast] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [scenarioData, setScenarioData] = useState({
    finalAmplitude: '',
    finalDirection: '',
    duration: '',
    updateFrequency: ''
  });

  // Radar dimensions
  const size = 600;
  const center = size / 2;
  const radius = (size - 60) / 2;

  // Create concentric circles
  const circles = [0.25, 0.5, 0.75, 1].map((scale, index) => (
    <circle
      key={index}
      cx={center}
      cy={center}
      r={radius * scale}
      className="radar-circle"
    />
  ));

  // Create axis lines
  const axisLines = [0, 45, 90, 135].map((angle, index) => (
    <line
      key={index}
      x1={center}
      y1={center}
      x2={center + radius * Math.cos((angle * Math.PI) / 180)}
      y2={center + radius * Math.sin((angle * Math.PI) / 180)}
      className="radar-line"
    />
  ));

  // Create angle labels
  const angleLabels = [
    { angle: 0, text: "0°" },
    { angle: 45, text: "45°" },
    { angle: 90, text: "90°" },
    { angle: 135, text: "135°" },
    { angle: 180, text: "180°" },
    { angle: 225, text: "225°" },
    { angle: 270, text: "270°" },
    { angle: 315, text: "315°" }
  ].map(({ angle, text }, index) => {
    const labelRadius = radius + 30;
    const x = center + labelRadius * Math.cos((angle * Math.PI) / 180);
    const y = center + labelRadius * Math.sin((angle * Math.PI) / 180);
    return (
      <text
        key={index}
        x={x}
        y={y}
        className="radar-label"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {text}
      </text>
    );
  });

  // Calculate broadcast positions
  const broadcastPoints = broadcasts.map((broadcast) => {
    const formData = broadcast.formData;
    
    // Use direction for angle (0-360 degrees)
    const angleRad = (formData.direction * Math.PI) / 180;
    
    // Use amplitude for distance from center (normalize to 0-1 and scale by radius)
    // Assuming amplitude range 0-100, adjust as needed
    const maxAmplitude = 100;
    const normalizedAmplitude = Math.min(formData.amplitude / maxAmplitude, 1);
    const distance = normalizedAmplitude * radius;
    
    // Calculate x, y coordinates
    const x = center + distance * Math.cos(angleRad);
    const y = center + distance * Math.sin(angleRad);

    return {
      ...broadcast,
      x,
      y,
      distance: normalizedAmplitude,
      angle: formData.direction
    };
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleBroadcastClick = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setScenarioData({
      finalAmplitude: '',
      finalDirection: '',
      duration: '',
      updateFrequency: ''
    });
    setShowScenarioModal(true);
  };

  const handleScenarioSubmit = async () => {
    if (!selectedBroadcast || !scenarioData.finalAmplitude || !scenarioData.finalDirection || 
        !scenarioData.duration || !scenarioData.updateFrequency) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/forms/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          broadcastId: selectedBroadcast.id,
          finalAmplitude: parseFloat(scenarioData.finalAmplitude),
          finalDirection: parseFloat(scenarioData.finalDirection),
          duration: parseFloat(scenarioData.duration),
          updateFrequency: parseFloat(scenarioData.updateFrequency)
        }),
      });

      if (response.ok) {
        alert('Senaryo başarıyla oluşturuldu!');
        setShowScenarioModal(false);
        setSelectedBroadcast(null);
        // Broadcast listesini güncelle
        if (onBroadcastUpdated) {
          onBroadcastUpdated();
        }
      } else {
        alert('Senaryo oluşturulurken hata oluştu.');
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      alert('Senaryo oluşturulurken hata oluştu.');
    }
  };

  const handleCloseModal = () => {
    setShowScenarioModal(false);
    setSelectedBroadcast(null);
  };

  return (
    <div className="radar-container">
      <svg 
        width={size} 
        height={size} 
        className="radar-display"
        onMouseMove={handleMouseMove}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="radar-background"
        />
        
        {/* Grid circles and lines */}
        {circles}
        {axisLines}
        {angleLabels}

        {/* Broadcast points */}
        {broadcastPoints.map((broadcast) => {
          const formData = broadcast.formData;
          const isActive = formData.active;
          const isTcpSent = formData.tcpSent;
          
          let pointClass = 'broadcast-point';
          if (isActive) {
            pointClass += ' active';
          } else if (isTcpSent) {
            pointClass += ' sent';
          } else {
            pointClass += ' not-sent';
          }

          return (
            <circle
              key={broadcast.id}
              cx={broadcast.x}
              cy={broadcast.y}
              r="8"
              className={pointClass}
              onMouseEnter={() => setHoveredBroadcast(broadcast)}
              onMouseLeave={() => setHoveredBroadcast(null)}
              onClick={() => handleBroadcastClick(broadcast)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredBroadcast && (
        <div 
          className="broadcast-tooltip"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10
          }}
        >
          <div className="tooltip-title">{hoveredBroadcast.formData.name}</div>
          <div className="tooltip-content">
            <div>Yön: {hoveredBroadcast.formData.direction}°</div>
            <div>Genlik: {hoveredBroadcast.formData.amplitude}</div>
            <div>PRI: {hoveredBroadcast.formData.pri}</div>
            <div>Pulse Width: {hoveredBroadcast.formData.pulseWidth}</div>
            <div>Durum: {hoveredBroadcast.formData.active ? 'Aktif' : 'Deaktif'}</div>
            <div>TCP: {hoveredBroadcast.formData.tcpSent ? 'Gönderildi' : 'Gönderilmedi'}</div>
          </div>
        </div>
      )}

      {/* Senaryo Modal */}
      {showScenarioModal && selectedBroadcast && (
        <div className="scenario-modal-overlay">
          <div className="scenario-modal">
            <div className="scenario-modal-header">
              <h3>Senaryo Oluştur - {selectedBroadcast.formData.name}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="scenario-modal-content">
              <div className="current-values">
                <h4>Mevcut Değerler:</h4>
                <p>Genlik: {selectedBroadcast.formData.amplitude}</p>
                <p>Yön: {selectedBroadcast.formData.direction}°</p>
              </div>

              <div className="scenario-form">
                <div className="form-group">
                  <label>Final Genlik:</label>
                  <input
                    type="number"
                    value={scenarioData.finalAmplitude}
                    onChange={(e) => setScenarioData({...scenarioData, finalAmplitude: e.target.value})}
                    placeholder="Final genlik değeri"
                  />
                </div>

                <div className="form-group">
                  <label>Final Yön (derece):</label>
                  <input
                    type="number"
                    value={scenarioData.finalDirection}
                    onChange={(e) => setScenarioData({...scenarioData, finalDirection: e.target.value})}
                    placeholder="Final yön değeri (0-360)"
                    min="0"
                    max="360"
                  />
                </div>

                <div className="form-group">
                  <label>Süre (saniye):</label>
                  <input
                    type="number"
                    value={scenarioData.duration}
                    onChange={(e) => setScenarioData({...scenarioData, duration: e.target.value})}
                    placeholder="Toplam süre"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Güncellenme Sıklığı (saniye):</label>
                  <input
                    type="number"
                    value={scenarioData.updateFrequency}
                    onChange={(e) => setScenarioData({...scenarioData, updateFrequency: e.target.value})}
                    placeholder="Kaç saniyede bir güncellensin"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="scenario-modal-actions">
                <button className="scenario-cancel-btn" onClick={handleCloseModal}>
                  İptal
                </button>
                <button className="scenario-submit-btn" onClick={handleScenarioSubmit}>
                  Senaryo Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarDisplay; 