import React, { useState } from 'react';
import './RadarDisplay.css';

const RadarDisplay = ({ broadcasts = [], onBroadcastUpdated }) => {
  const [hoveredBroadcast, setHoveredBroadcast] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
        </div>
      )}
    </div>
  );
};

export default RadarDisplay; 