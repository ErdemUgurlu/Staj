import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import BroadcastForm from './components/BroadcastForm';
import ActivityLogs from './components/ActivityLogs';
import RadarDisplay from './components/RadarDisplay';

function App() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const activityLogsRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Convert yayinEkle messages to broadcast format for radar display
        const yayinEkleMessages = data.filter(msg => msg.messageType === 'yayinEkle');
        const yayinBaslatMessages = data.filter(msg => msg.messageType === 'yayinBaslat');
        const yayinDurdurMessages = data.filter(msg => msg.messageType === 'yayinDurdur');
        const yayinSilMessages = data.filter(msg => msg.messageType === 'yayinSil');
        
        const broadcastData = yayinEkleMessages
          .map(msg => {
            try {
              const params = JSON.parse(msg.parameters || '{}');
              
              // Check if there's a corresponding yayinBaslat message for this yayinId
              const hasBaslatMessage = yayinBaslatMessages.some(baslatMsg => {
                try {
                  const baslatParams = JSON.parse(baslatMsg.parameters || '{}');
                  return baslatParams.yayinId === params.yayinId && baslatMsg.sent;
                } catch (e) {
                  console.warn('Error parsing baslatMsg parameters for message:', baslatMsg.id, e);
                  return false;
                }
              });
              
              // Check if there's a corresponding yayinDurdur message sent for this yayinId
              const hasDurdurMessage = yayinDurdurMessages.some(stopMsg => {
                try {
                  const stopParams = JSON.parse(stopMsg.parameters || '{}');
                  return stopParams.yayinId === params.yayinId && stopMsg.sent;
                } catch (e) {
                  console.warn('Error parsing stopMsg parameters for message:', stopMsg.id, e);
                  return false;
                }
              });
              
              // Check if there's a yayinSil message sent for this yayinId
              const hasSilMessage = yayinSilMessages.some(silMsg => {
                try {
                  const silParams = JSON.parse(silMsg.parameters || '{}');
                  return silParams.yayinId === params.yayinId && silMsg.sent;
                } catch (e) {
                  console.warn('Error parsing silMsg parameters for message:', silMsg.id, e);
                  return false;
                }
              });
              
              return {
                id: msg.id,
                formData: {
                  id: params.yayinId || 'unknown',
                  name: msg.messageName || 'Unnamed',
                  amplitude: params.amplitude || 0,
                  direction: params.direction || 0,
                  pri: params.pri || 0,
                  pulseWidth: params.pulseWidth || 0,
                  active: hasBaslatMessage && !hasDurdurMessage && !hasSilMessage, // active if started and not stopped or sil
                  tcpSent: msg.sent
                }
              };
            } catch (e) {
              console.warn('Error parsing message parameters for message:', msg.id, e);
              return null;
            }
          })
          .filter(Boolean);
        
        setBroadcasts(broadcastData);
      } else {
        console.error('Error fetching messages:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Hata durumunda boş array'ler set et
      setMessages([]);
      setBroadcasts([]);
    }
  }, []);

  const fetchBroadcasts = async () => {
    // This is kept for backwards compatibility but now uses fetchMessages
    await fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    
    // Refresh messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleFormSubmitted = () => {
    fetchMessages();
    // Only refresh logs when a form is actually submitted
    if (activityLogsRef.current) {
      activityLogsRef.current();
    }
  };

  const handleRefreshRequest = (logsRefreshCallback) => {
    // Store the logs refresh callback but don't call it automatically
    activityLogsRef.current = logsRefreshCallback;
  };

  const handleBroadcastClick = (broadcast) => {
    if (broadcast.formData) {
      // Sadece aktif yayınlar için senaryo oluşturulabilir
      if (!broadcast.formData.active) {
        alert('Senaryo sadece aktif yayınlar için oluşturulabilir. Lütfen önce yayını aktif hale getirin.');
        return;
      }
      setSelectedBroadcast(broadcast.formData);
      setScenarioModalOpen(true);
    }
  };

  const handleScenarioSubmit = async (scenarioData) => {
    if (!selectedBroadcast) return;

    try {
      const response = await fetch('http://localhost:8080/api/forms/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          broadcastId: selectedBroadcast.id,
          initialAmplitude: selectedBroadcast.amplitude,
          initialDirection: selectedBroadcast.direction,
          finalAmplitude: scenarioData.finalAmplitude,
          finalDirection: scenarioData.finalDirection,
          duration: scenarioData.duration,
          updateFrequency: scenarioData.updateFrequency,
          isActive: true
        }),
      });

      if (response.ok) {
        alert('Senaryo başarıyla oluşturuldu!');
        setScenarioModalOpen(false);
        setSelectedBroadcast(null);
        fetchMessages();
        if (activityLogsRef.current) {
          activityLogsRef.current();
        }
      } else {
        alert('Senaryo oluşturulurken hata oluştu!');
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      alert('Senaryo oluşturulurken hata oluştu!');
    }
  };

  const renderScenarioModal = () => {
    if (!scenarioModalOpen || !selectedBroadcast) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          width: '500px',
          maxWidth: '90vw'
        }}>
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px',
            margin: '-30px -30px 20px -30px',
            borderRadius: '10px 10px 0 0',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0 }}>Senaryo Oluştur - {selectedBroadcast.name}</h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Mevcut Değerler:</h4>
            <p><strong>ID:</strong> {selectedBroadcast.id}</p>
            <p><strong>Genlik:</strong> {selectedBroadcast.amplitude}</p>
            <p><strong>Yön:</strong> {selectedBroadcast.direction}°</p>
            <p><strong>PRI:</strong> {selectedBroadcast.pri}</p>
            <p><strong>Pulse Width:</strong> {selectedBroadcast.pulseWidth}</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleScenarioSubmit({
              finalAmplitude: parseFloat(formData.get('finalAmplitude')),
              finalDirection: parseFloat(formData.get('finalDirection')),
              duration: parseFloat(formData.get('duration')),
              updateFrequency: parseFloat(formData.get('updateFrequency'))
            });
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Final Genlik:
              </label>
              <input
                type="number"
                name="finalAmplitude"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Final Yön (derece):
              </label>
              <input
                type="number"
                name="finalDirection"
                min="0"
                max="360"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Süre (saniye):
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Güncelleme Sıklığı (saniye):
              </label>
              <input
                type="number"
                name="updateFrequency"
                min="0.1"
                step="0.1"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => {
                  setScenarioModalOpen(false);
                  setSelectedBroadcast(null);
                }}
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Senaryo Başlat
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mesaj Yönetim Sistemi</h1>
      </header>

      <main className="app-main">
        <div className="form-section">
          <BroadcastForm onFormSubmitted={handleFormSubmitted} />
        </div>

        <div className="radar-section">
          <RadarDisplay broadcasts={broadcasts} onBroadcastUpdated={fetchBroadcasts} />
        </div>

        <div className="broadcast-list-section">
          <h3>Var Olan Yayınlar Listesi</h3>
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {broadcasts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                Henüz var olan yayın bulunmuyor
              </p>
            ) : (
              broadcasts.map((broadcast, index) => {
                const isActive = broadcast.formData?.active || false;
                const isClickable = isActive; // Sadece aktif yayınlar tıklanabilir
                
                return (
                  <div
                    key={broadcast.id || index}
                    onClick={() => isClickable && handleBroadcastClick(broadcast)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      margin: '8px 0',
                      backgroundColor: isActive ? 'white' : '#f8f9fa',
                      border: `1px solid ${isActive ? '#ddd' : '#e9ecef'}`,
                      borderRadius: '6px',
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      minHeight: '50px',
                      opacity: isActive ? 1 : 0.7,
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (isClickable) {
                        e.target.style.backgroundColor = '#e3f2fd';
                        e.target.style.borderColor = '#007bff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isClickable) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#ddd';
                      }
                    }}
                  >
                    {/* Aktif olmayan yayınlar için overlay */}
                    {!isActive && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(108, 117, 125, 0.1)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6c757d',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                      }}>
                        <span style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}>
                          Senaryo için önce aktif hale getirin
                        </span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <input
                        type="checkbox"
                        readOnly
                        checked={isActive}
                        style={{ marginRight: '12px' }}
                      />
                      <div style={{ fontWeight: 'bold', minWidth: '150px' }}>
                        {broadcast.formData?.name || `Yayın ${index + 1}`}
                      </div>
                      <div style={{ flex: 1, fontSize: '14px', color: '#666' }}>
                        Genlik: {broadcast.formData?.amplitude || 0} | 
                        PRI: {broadcast.formData?.pri || 0} | 
                        Yön: {broadcast.formData?.direction || 0}° | 
                        Pulse Width: {broadcast.formData?.pulseWidth || 0}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                      {broadcast.formData?.tcpSent ? (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          TCP Gönderildi
                        </span>
                      ) : (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#ffc107',
                          color: 'black',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          TCP Gönderilmedi
                        </span>
                      )}
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: isActive ? '#28a745' : '#dc3545',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {isActive ? 'Aktif' : 'Deaktif'}
                      </span>
                      {isActive && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          Senaryo Eklenebilir
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="logs-section">
          <ActivityLogs onRefreshRequest={handleRefreshRequest} />
        </div>
      </main>

      {renderScenarioModal()}
    </div>
  );
}

export default App;
