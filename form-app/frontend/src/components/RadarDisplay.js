import React, { useState } from 'react';
import './RadarDisplay.css';

const RadarDisplay = ({ broadcasts = [], onBroadcastUpdated }) => {
  const [hoveredBroadcast, setHoveredBroadcast] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Filter states
  const [filters, setFilters] = useState({
    active: true,        // Aktif yayınlar
    inactive: true,      // Deaktif yayınlar
    tcpSent: true,       // TCP gönderilmiş
    tcpNotSent: true     // TCP gönderilmemiş
  });

  // Radar dimensions
  const size = 600;
  const center = size / 2;
  const radius = (size - 120) / 2;

  // Filter broadcasts based on selected filters
  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const formData = broadcast.formData;
    const isActive = formData.active;
    const isTcpSent = formData.tcpSent;
    
    // Check if broadcast matches any selected filter
    if (isActive && !filters.active) return false;
    if (!isActive && !filters.inactive) return false;
    if (isTcpSent && !filters.tcpSent) return false;
    if (!isTcpSent && !filters.tcpNotSent) return false;
    
    return true;
  });

  const handleFilterChange = (filterKey) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterKey]: !prev[filterKey]
      };
      
      // Eğer TCP gönderilmiş seçiliyorsa, otomatik olarak aktif ve deaktif de seçilsin
      if (filterKey === 'tcpSent' && !prev[filterKey]) {
        newFilters.active = true;
        newFilters.inactive = true;
      }
      
      // Eğer TCP gönderilmemiş seçiliyorsa, otomatik olarak aktif ve deaktif de seçilsin
      if (filterKey === 'tcpNotSent' && !prev[filterKey]) {
        newFilters.active = true;
        newFilters.inactive = true;
      }
      
      return newFilters;
    });
  };

  const selectAllFilters = () => {
    setFilters({
      active: true,
      inactive: true,
      tcpSent: true,
      tcpNotSent: true
    });
  };

  const clearAllFilters = () => {
    setFilters({
      active: false,
      inactive: false,
      tcpSent: false,
      tcpNotSent: false
    });
  };

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
    const labelRadius = radius + 50; // More space for labels
    const x = center + labelRadius * Math.cos((angle * Math.PI) / 180);
    const y = center + labelRadius * Math.sin((angle * Math.PI) / 180);
    
    // Adjust text anchor and baseline based on angle for better positioning
    let textAnchor = "middle";
    let dominantBaseline = "middle";
    
    // Fine-tune position based on angle
    if (angle === 0) {
      textAnchor = "start";
      dominantBaseline = "central";
    } else if (angle === 180) {
      textAnchor = "end";
      dominantBaseline = "central";
    } else if (angle === 90) {
      textAnchor = "middle";
      dominantBaseline = "auto";
    } else if (angle === 270) {
      textAnchor = "middle";
      dominantBaseline = "hanging";
    } else if (angle > 0 && angle < 90) {
      textAnchor = "start";
      dominantBaseline = "auto";
    } else if (angle > 90 && angle < 180) {
      textAnchor = "end";
      dominantBaseline = "auto";
    } else if (angle > 180 && angle < 270) {
      textAnchor = "end";
      dominantBaseline = "hanging";
    } else if (angle > 270 && angle < 360) {
      textAnchor = "start";
      dominantBaseline = "hanging";
    }

    return (
      <text
        key={index}
        x={x}
        y={y}
        className="radar-label"
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
      >
        {text}
      </text>
    );
  });

  // Calculate broadcast positions for filtered broadcasts
  const broadcastPoints = filteredBroadcasts.map((broadcast) => {
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

  return (
    <div className="radar-container">
      {/* Filter Controls */}
      <div className="radar-filters">
        <div className="filter-header">
          <h4>Radar Filtreleri</h4>
          <div className="filter-buttons">
            <button className="filter-btn select-all" onClick={selectAllFilters}>
              Tümünü Seç
            </button>
            <button className="filter-btn clear-all" onClick={clearAllFilters}>
              Hiçbirini Seçme
            </button>
          </div>
        </div>
        
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.active}
              onChange={() => handleFilterChange('active')}
            />
            <span className="filter-label active">🟢 Aktif Yayınlar ({broadcasts.filter(b => b.formData.active).length})</span>
          </label>
          
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.inactive}
              onChange={() => handleFilterChange('inactive')}
            />
            <span className="filter-label inactive">🔴 Deaktif Yayınlar ({broadcasts.filter(b => !b.formData.active).length})</span>
          </label>
          
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.tcpSent}
              onChange={() => handleFilterChange('tcpSent')}
            />
            <span className="filter-label tcp-sent" title="Seçildiğinde otomatik olarak Aktif ve Deaktif yayınlar da seçilir">
              📤 TCP Gönderilmiş ({broadcasts.filter(b => b.formData.tcpSent).length})
            </span>
          </label>
          
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.tcpNotSent}
              onChange={() => handleFilterChange('tcpNotSent')}
            />
            <span className="filter-label tcp-not-sent" title="Seçildiğinde otomatik olarak Aktif ve Deaktif yayınlar da seçilir">
              📥 TCP Gönderilmemiş ({broadcasts.filter(b => !b.formData.tcpSent).length})
            </span>
          </label>
        </div>
        
        <div className="filter-summary">
          Toplam: {broadcasts.length} | Görüntülenen: {filteredBroadcasts.length}
        </div>
        
        <div className="filter-info">
          💡 İpucu: TCP filtreleri seçildiğinde otomatik olarak Aktif/Deaktif filtreler de seçilir
        </div>
      </div>

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

        {/* Center emoji */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '24px' }}
        >
          📡
        </text>

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
            top: mousePos.y - 10,
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000
          }}
        >
          <div><strong>{hoveredBroadcast.formData.name}</strong></div>
          <div>Yön: {hoveredBroadcast.formData.direction}°</div>
          <div>Genlik: {hoveredBroadcast.formData.amplitude}</div>
          <div>PRI: {hoveredBroadcast.formData.pri}</div>
          <div>Pulse Width: {hoveredBroadcast.formData.pulseWidth}</div>
          <div>Durum: {hoveredBroadcast.formData.active ? 'Aktif' : 'Deaktif'}</div>
          <div>TCP: {hoveredBroadcast.formData.tcpSent ? 'Gönderildi' : 'Gönderilmedi'}</div>
        </div>
      )}
    </div>
  );
};

export default RadarDisplay; 