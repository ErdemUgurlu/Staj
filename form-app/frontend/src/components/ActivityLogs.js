import React, { useState, useEffect } from 'react';
import './ActivityLogs.css';

const ActivityLogs = ({ onRefreshRequest }) => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []); // Only fetch once on mount

  // Listen for refresh requests from parent
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(fetchLogs);
    }
  }, [onRefreshRequest]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/forms/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogClick = async (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const handleCloseModal = () => {
    setShowLogModal(false);
    setSelectedLog(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '✅';
      case 'UPDATE': return '📝';
      case 'DELETE': return '🗑️';
      case 'ACTIVATE': return '▶️';
      case 'DEACTIVATE': return '⏸️';
      default: return '📋';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return '#28a745';
      case 'UPDATE': return '#007bff';
      case 'DELETE': return '#dc3545';
      case 'ACTIVATE': return '#28a745';
      case 'DEACTIVATE': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getEntityTypeIcon = (entityType) => {
    switch (entityType) {
      case 'BROADCAST': return '📡';
      case 'SCENARIO': return '📋';
      case 'MESSAGE': return '📨';
      default: return '📄';
    }
  };

  const renderEntityData = (entityData) => {
    if (!entityData) return <span className="no-data">Veri bulunamadı</span>;

    // Message parametrelerini de dahil et
    const fieldOrder = ['messageName', 'messageType', 'yayinId', 'amplitude', 'pri', 'direction', 'pulseWidth', 'newDirection', 'newAmplitude', 'saved', 'sent', 'name', 'active', 'tcpSent'];
    const sortedEntries = fieldOrder
      .filter(field => entityData.hasOwnProperty(field))
      .map(field => [field, entityData[field]])
      .concat(
        Object.entries(entityData).filter(([key]) => !fieldOrder.includes(key))
      );

    return (
      <div className="entity-data">
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="data-field">
            <span className="data-label">{formatFieldName(key)}:</span>
            <span className="data-value">{formatFieldValue(key, value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatFieldName = (fieldName) => {
    const fieldMap = {
      'id': 'ID',
      'name': 'Yayın Adı',
      'messageName': 'Mesaj Adı',
      'messageType': 'Mesaj Tipi',
      'yayinId': 'Yayın ID',
      'amplitude': 'Genlik',
      'pri': 'PRI',
      'direction': 'Yön (Derece)',
      'pulseWidth': 'Pulse Width',
      'newDirection': 'Yeni Yön',
      'newAmplitude': 'Yeni Genlik',
      'active': 'Durum',
      'tcpSent': 'TCP Durumu',
      'saved': 'Kaydedildi',
      'sent': 'Gönderildi',
      'parameters': 'Parametreler',
      'scenarioId': 'Senaryo ID',
      'broadcastId': 'Yayın ID',
      'finalAmplitude': 'Final Genlik',
      'finalDirection': 'Final Yön',
      'duration': 'Süre',
      'updateFrequency': 'Güncellenme Sıklığı',
      'inactiveIntervals': 'Deaktif Aralıkları'
    };
    return fieldMap[fieldName] || fieldName;
  };

  const formatFieldValue = (fieldName, value) => {
    if (value === null || value === undefined) return '-';
    if (fieldName === 'active') return value ? 'Aktif' : 'Deaktif';
    if (fieldName === 'tcpSent') return value ? 'Gönderildi' : 'Gönderilmedi';
    if (fieldName === 'saved') return value ? 'Kaydedildi' : 'Kaydedilmedi';
    if (fieldName === 'sent') return value ? 'Gönderildi' : 'Gönderilmedi';
    if (fieldName === 'inactiveIntervals' && Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Yok';
    }
    if (fieldName === 'duration') return `${value} saniye`;
    if (fieldName === 'updateFrequency') return `${value} saniye`;
    if (fieldName === 'direction' || fieldName === 'newDirection') return `${value}°`;
    if (fieldName === 'amplitude' || fieldName === 'pri' || fieldName === 'pulseWidth' || fieldName === 'newAmplitude') {
      return `${value}`;
    }
    if (fieldName === 'parameters' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ');
      } catch (e) {
        return value;
      }
    }
    if (typeof value === 'string' && value.length > 30) {
      return value.substring(0, 8) + '...';
    }
    return value.toString();
  };

  // Log başlığını mesaj tipine göre ayarla
  const getLogTitle = (log) => {
    if (log.entityType === 'MESSAGE' && log.entityData && log.entityData.messageType) {
      return log.entityData.messageType;
    }
    return log.description || 'Bilinmeyen İşlem';
  };

  if (loading) {
    return (
      <div className="activity-logs">
        <div className="logs-header">
          <h3>Sistem Logları</h3>
        </div>
        <div className="loading">Loglar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="activity-logs">
      <div className="logs-header">
        <h3>Sistem Logları ({logs.length})</h3>
        <div className="refresh-controls">
          <button onClick={fetchLogs} className="refresh-btn" title="Şimdi Yenile">
            ⟳
          </button>
        </div>
      </div>
      
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">Henüz log kaydı bulunmamaktadır.</div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div
                key={log.id}
                className="log-item"
                onClick={() => handleLogClick(log)}
                title="Detayları görmek için tıklayın"
              >
                <div className="log-main">
                  <span className="log-icon" style={{ color: getActionColor(log.action) }}>
                    {getActionIcon(log.action)}
                  </span>
                  <span className="entity-icon">
                    {getEntityTypeIcon(log.entityType)}
                  </span>
                  <span className="log-description">{getLogTitle(log)}</span>
                </div>
                <div className="log-meta">
                  <span className="log-time">{formatDate(log.timestamp)}</span>
                  <span className="log-entity-id" title={log.entityId}>
                    {log.entityId ? log.entityId.substring(0, 8) + '...' : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {showLogModal && selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content log-modal">
            <div className="modal-header">
              <h3>
                <span style={{ color: getActionColor(selectedLog.action) }}>
                  {getActionIcon(selectedLog.action)}
                </span>
                <span className="entity-icon">
                  {getEntityTypeIcon(selectedLog.entityType)}
                </span>
                {selectedLog.entityType === 'MESSAGE' && selectedLog.entityData && selectedLog.entityData.messageType
                  ? `${selectedLog.entityData.messageType} - Log Detayları`
                  : selectedLog.entityData && selectedLog.entityData.name 
                    ? `${selectedLog.entityData.name} - Log Detayları`
                    : `${selectedLog.entityType} Log Detayları`
                }
              </h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="log-details">
                <div className="detail-section">
                  <h4>Genel Bilgiler</h4>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <span className="detail-label">İşlem:</span>
                      <span className="detail-value">
                        <span style={{ color: getActionColor(selectedLog.action) }}>
                          {getActionIcon(selectedLog.action)} {selectedLog.action}
                        </span>
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Tür:</span>
                      <span className="detail-value">
                        {getEntityTypeIcon(selectedLog.entityType)} {selectedLog.entityType}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Açıklama:</span>
                      <span className="detail-value">{selectedLog.description}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Tarih/Saat:</span>
                      <span className="detail-value">{formatDate(selectedLog.timestamp)}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Hedef ID:</span>
                      <span className="detail-value" title={selectedLog.entityId}>
                        {selectedLog.entityId}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedLog.entityData && (
                  <div className="detail-section">
                    <h4>
                      {selectedLog.entityType === 'BROADCAST' ? 'Yayın Parametreleri' : selectedLog.entityType === 'MESSAGE' ? 'Mesaj Parametreleri' : 'Senaryo Parametreleri'}
                    </h4>
                    {renderEntityData(selectedLog.entityData)}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="close-btn" onClick={handleCloseModal}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs; 