import React, { useState, useEffect } from 'react';
import './ActivityLogs.css';

const ActivityLogs = ({ onRefreshRequest }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState('ALL');
  const [messageTypeFilter, setMessageTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []); // Only fetch once on mount

  // Apply filters whenever logs or filter states change
  useEffect(() => {
    applyFilters();
  }, [logs, actionFilter, messageTypeFilter, dateFilter]);

  // Listen for refresh requests from parent
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(fetchLogs);
    }
  }, [onRefreshRequest]);

  const applyFilters = () => {
    let filtered = logs;

    // Action filter
    if (actionFilter !== 'ALL') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Message type filter
    if (messageTypeFilter !== 'ALL') {
      filtered = filtered.filter(log => {
        if (log.entityType === 'MESSAGE' && log.entityData && log.entityData.messageType) {
          return log.entityData.messageType === messageTypeFilter;
        }
        return messageTypeFilter === 'OTHER';
      });
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'LAST_HOUR':
          filterDate.setHours(filterDate.getHours() - 1);
          break;
        case 'LAST_24H':
          filterDate.setDate(filterDate.getDate() - 1);
          break;
        case 'LAST_WEEK':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredLogs(filtered);
  };

  const resetFilters = () => {
    setActionFilter('ALL');
    setMessageTypeFilter('ALL');
    setDateFilter('ALL');
  };

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  };

  const getUniqueMessageTypes = () => {
    const messageTypes = [...new Set(logs
      .filter(log => log.entityType === 'MESSAGE' && log.entityData && log.entityData.messageType)
      .map(log => log.entityData.messageType)
    )];
    return messageTypes.sort();
  };

  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'yayınEkle': return '📡➕';
      case 'yayınBaslat': return '▶️';
      case 'yayınDurdur': return '⏹️';
      case 'yayınYonGuncelle': return '🧭';
      case 'yayınGenlikGuncelle': return '📶';
      case 'senaryoEkle': return '📋➕';
      case 'senaryoBaslat': return '🎬';
      case 'senaryoDurdur': return '⏸️';
      default: return '📨';
    }
  };

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
        <h3>Sistem Logları ({filteredLogs.length}/{logs.length})</h3>
        <div className="header-controls">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            title="Filtreleri Göster/Gizle"
          >
            🔍 Filtrele
          </button>
          <button onClick={fetchLogs} className="refresh-btn" title="Şimdi Yenile">
            ⟳
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>İşlem Tipi:</label>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="ALL">Tümü</option>
                {getUniqueActions().map(action => (
                  <option key={action} value={action}>
                    {getActionIcon(action)} {action}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Mesaj Tipi:</label>
              <select value={messageTypeFilter} onChange={(e) => setMessageTypeFilter(e.target.value)}>
                <option value="ALL">Tümü</option>
                {getUniqueMessageTypes().map(messageType => (
                  <option key={messageType} value={messageType}>
                    {getMessageTypeIcon(messageType)} {messageType}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Zaman Aralığı:</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="ALL">Tüm Zamanlar</option>
                <option value="LAST_HOUR">Son Saat</option>
                <option value="TODAY">Bugün</option>
                <option value="LAST_24H">Son 24 Saat</option>
                <option value="LAST_WEEK">Son Hafta</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={resetFilters} className="reset-filters-btn" title="Filtreleri Sıfırla">
                ↺ Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            {logs.length === 0 ? 'Henüz log kaydı bulunmamaktadır.' : 'Filtrelere uygun log bulunamadı.'}
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
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