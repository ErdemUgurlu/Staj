import React, { useState, useEffect } from 'react';
import './Forms.css';

const BroadcastForm = ({ onFormSubmitted }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [selectedBroadcasts, setSelectedBroadcasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMultiple, setIsSendingMultiple] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [updateFormData, setUpdateFormData] = useState({
    id: '',
    name: '',
    amplitude: 0,
    pri: 0,
    direction: 0,
    pulseWidth: 0,
  });
  const [formData, setFormData] = useState({
    name: '',
    amplitude: 0,
    pri: 0,
    direction: 0,
    pulseWidth: 0,
  });
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isNewBroadcast, setIsNewBroadcast] = useState(false);
  const [newBroadcastName, setNewBroadcastName] = useState('');

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/type/Broadcast');
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data);
      } else {
        console.error('Error fetching broadcasts:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/logs');
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      } else {
        console.error('Error fetching activity logs:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchActivityLogs();
  }, []); // Only run once on mount

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

  const getCreationDate = (broadcastId) => {
    const createLog = activityLogs.find(log => 
      log.entityId === broadcastId && 
      log.action === 'CREATE' && 
      log.entityType === 'BROADCAST'
    );
    return createLog ? formatDate(createLog.timestamp) : '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const handleCheckboxChange = (broadcastId) => {
    setSelectedBroadcasts(prev => {
      if (prev.includes(broadcastId)) {
        return prev.filter(id => id !== broadcastId);
      } else {
        return [...prev, broadcastId];
      }
    });
  };

  const handleSendSelected = async () => {
    if (selectedBroadcasts.length === 0) return;
    
    setIsSendingMultiple(true);
    try {
      const promises = selectedBroadcasts.map(id => 
        fetch(`http://localhost:8080/api/forms/broadcast/${id}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
      
      await Promise.all(promises);
      await fetchBroadcasts();
      setSelectedBroadcasts([]);
      if (onFormSubmitted) onFormSubmitted();
    } catch (error) {
      console.error('Error sending selected broadcasts:', error);
      alert('Yayınlar gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSendingMultiple(false);
  };

  const handleActivateSelected = async () => {
    if (selectedBroadcasts.length === 0) return;
    
    // Sadece TCP'ye gönderilmiş ve aktif olmayan yayınları filtrele
    const validBroadcasts = selectedBroadcasts.filter(id => {
      const broadcast = broadcasts.find(b => b.id === id);
      return broadcast && broadcast.formData.tcpSent && !broadcast.formData.active;
    });

    if (validBroadcasts.length === 0) {
      alert('Sadece TCP\'ye gönderilmiş ve deaktif yayınlar aktif edilebilir!');
      return;
    }
    
    setIsSendingMultiple(true);
    try {
      const promises = validBroadcasts.map(async id => {
        // TCP başlatma mesajı gönder ve yayını aktif et
        await fetch(`http://localhost:8080/api/forms/broadcast/${id}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      });
      
      await Promise.all(promises);
      await fetchBroadcasts();
      setSelectedBroadcasts([]);
      if (onFormSubmitted) onFormSubmitted();
    } catch (error) {
      console.error('Error activating selected broadcasts:', error);
      alert('Yayınlar aktif edilirken bir hata oluştu: ' + error.message);
    }
    setIsSendingMultiple(false);
  };

  const handleDeactivateSelected = async () => {
    if (selectedBroadcasts.length === 0) return;
    
    // Sadece aktif yayınları filtrele
    const validBroadcasts = selectedBroadcasts.filter(id => {
      const broadcast = broadcasts.find(b => b.id === id);
      return broadcast && broadcast.formData.active;
    });

    if (validBroadcasts.length === 0) {
      alert('Sadece aktif yayınlar deaktif edilebilir!');
      return;
    }
    
    setIsSendingMultiple(true);
    try {
      const promises = validBroadcasts.map(async id => {
        // TCP durdurma mesajı gönder ve yayını deaktif et
        await fetch(`http://localhost:8080/api/forms/broadcast/${id}/deactivate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      });
      
      await Promise.all(promises);
      await fetchBroadcasts();
      setSelectedBroadcasts([]);
      if (onFormSubmitted) onFormSubmitted();
    } catch (error) {
      console.error('Error deactivating selected broadcasts:', error);
      alert('Yayınlar deaktif edilirken bir hata oluştu: ' + error.message);
    }
    setIsSendingMultiple(false);
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const handleUpdateSelected = () => {
    if (selectedBroadcasts.length === 0) return;
    
    // Get the first selected broadcast (we'll only update one at a time)
    const broadcastToUpdate = broadcasts.find(b => b.id === selectedBroadcasts[0]);
    if (!broadcastToUpdate) return;

    setUpdateFormData({
      id: broadcastToUpdate.id,
      name: broadcastToUpdate.formData.name,
      amplitude: broadcastToUpdate.formData.amplitude,
      pri: broadcastToUpdate.formData.pri,
      direction: broadcastToUpdate.formData.direction,
      pulseWidth: broadcastToUpdate.formData.pulseWidth,
    });
    
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setShowSaveOptions(true);
  };

  const handleSaveOption = async (createNew) => {
    setIsNewBroadcast(createNew);
    if (createNew) {
      setShowSaveOptions(false);
      // Show new broadcast name input - it will be handled in the UI
    } else {
      // Update existing broadcast
      await handleSaveChanges();
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      const selectedBroadcast = broadcasts.find(b => b.id === selectedBroadcasts[0]);
      
      if (isNewBroadcast && !newBroadcastName.trim()) {
        alert('Lütfen yeni yayın için bir isim girin.');
        return;
      }

      // Prepare the data in the correct format
      const payload = {
        id: isNewBroadcast ? '' : selectedBroadcast.id,
        name: isNewBroadcast ? newBroadcastName : updateFormData.name,
        amplitude: parseFloat(updateFormData.amplitude),
        pri: parseFloat(updateFormData.pri),
        direction: parseFloat(updateFormData.direction),
        pulseWidth: parseFloat(updateFormData.pulseWidth),
        active: selectedBroadcast ? selectedBroadcast.formData.active : true,
        tcpSent: selectedBroadcast ? selectedBroadcast.formData.tcpSent : false
      };

      const response = await fetch(`http://localhost:8080/api/forms/broadcast${isNewBroadcast ? '' : `/${selectedBroadcast.id}`}`, {
        method: isNewBroadcast ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchBroadcasts();
        setIsUpdateModalOpen(false);
        setShowSaveOptions(false);
        setIsNewBroadcast(false);
        setNewBroadcastName('');
        setUpdateFormData({
          id: '',
          name: '',
          amplitude: 0,
          pri: 0,
          direction: 0,
          pulseWidth: 0,
        });
        onFormSubmitted();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Yayın güncellenirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating broadcast:', error);
      alert('Yayın güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBroadcasts.length === 0) return;
    
    setIsSendingMultiple(true);
    try {
      const promises = selectedBroadcasts.map(async id => {
        // TCP silme mesajı gönder ve veritabanından sil
        await fetch(`http://localhost:8080/api/forms/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      });
      
      await Promise.all(promises);
      await fetchBroadcasts();
      setSelectedBroadcasts([]);
    } catch (error) {
      console.error('Error deleting selected broadcasts:', error);
      alert('Yayınlar silinirken bir hata oluştu: ' + error.message);
    }
    setIsSendingMultiple(false);
  };

  const handleSubmit = async (shouldSendTcp) => {
    setIsSubmitting(true);
    try {
      const endpoint = shouldSendTcp ? '/api/forms/broadcast/send' : '/api/forms/broadcast/save';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: '',
          name: formData.name,
          amplitude: parseFloat(formData.amplitude),
          pri: parseFloat(formData.pri),
          direction: parseFloat(formData.direction),
          pulseWidth: parseFloat(formData.pulseWidth),
          active: true,
          tcpSent: shouldSendTcp
        }),
      });

      if (response.ok) {
        setFormData({
          name: '',
          amplitude: 0,
          pri: 0,
          direction: 0,
          pulseWidth: 0,
        });
        setIsModalOpen(false);
        await fetchBroadcasts();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Yayın oluşturulurken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Yayın oluşturulurken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="broadcast-container">
      <div className="broadcasts-header">
        <h2>Kayıtlı Mesajlar ({broadcasts.length})</h2>
        <div className="header-buttons">
          <button 
            className="new-broadcast-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Yeni Yayın Oluştur
          </button>
          <button 
            className="send-selected-btn"
            onClick={handleSendSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'Gönderiliyor...' : `Yayın Ekle (${selectedBroadcasts.length})`}
          </button>
          <button 
            className="activate-selected-btn"
            onClick={handleActivateSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'İşleniyor...' : `Yayın Aktif Et (${selectedBroadcasts.length})`}
          </button>
          <button 
            className="update-selected-btn"
            onClick={handleUpdateSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'İşleniyor...' : `Yayın Güncelle (${selectedBroadcasts.length})`}
          </button>
          <button 
            className="deactivate-selected-btn"
            onClick={handleDeactivateSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'İşleniyor...' : `Yayın Deaktif Et (${selectedBroadcasts.length})`}
          </button>
          <button 
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'Siliniyor...' : `Yayın Sil (${selectedBroadcasts.length})`}
          </button>
        </div>
      </div>

      <div className="broadcasts-list">
        {broadcasts.map((broadcast) => {
          const broadcastData = broadcast.formData;
          const creationDate = getCreationDate(broadcast.id);
          
          return (
            <div key={broadcast.id} className={`broadcast-item ${broadcastData.active ? 'active' : broadcastData.tcpSent ? 'sent' : 'not-sent'}`}>
              <div className="broadcast-info">
                <input
                  type="checkbox"
                  className="broadcast-checkbox"
                  checked={selectedBroadcasts.includes(broadcast.id)}
                  onChange={() => handleCheckboxChange(broadcast.id)}
                />
                <span className="broadcast-name">{broadcastData.name}</span>
                <span className="broadcast-params">
                  Genlik: {broadcastData.amplitude} | 
                  PRI: {broadcastData.pri} | 
                  Yön: {broadcastData.direction} | 
                  Pulse Width: {broadcastData.pulseWidth}
                </span>
                <div className="broadcast-status">
                  <span className="broadcast-date">{creationDate}</span>
                  <span className={`status-badge ${broadcastData.tcpSent ? 'sent' : 'not-sent'}`}>
                    {broadcastData.tcpSent ? 'TCP Gönderildi' : 'TCP Gönderilmedi'}
                  </span>
                  <span className={`status-badge ${broadcastData.active ? 'active' : 'inactive'}`}>
                    {broadcastData.active ? 'Aktif' : 'Deaktif'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Parametrelerini Güncelle</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setShowSaveOptions(false);
                  setIsNewBroadcast(false);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="broadcast-form">
              {!showSaveOptions ? (
                <>
                  <div className="form-group">
                    <label>Genlik:</label>
                    <input
                      type="number"
                      name="amplitude"
                      value={updateFormData.amplitude}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>PRI:</label>
                    <input
                      type="number"
                      name="pri"
                      value={updateFormData.pri}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Yön:</label>
                    <input
                      type="number"
                      name="direction"
                      value={updateFormData.direction}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pulse Width:</label>
                    <input
                      type="number"
                      name="pulseWidth"
                      value={updateFormData.pulseWidth}
                      onChange={handleUpdateInputChange}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="submit"
                      className="save-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Devam Et'}
                    </button>
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsUpdateModalOpen(false)}
                    >
                      İptal
                    </button>
                  </div>
                </>
              ) : (
                <div className="save-options">
                  <h3>Değişiklikleri nasıl kaydetmek istersiniz?</h3>
                  <div className="save-buttons">
                    <button type="button" onClick={() => handleSaveOption(false)}>
                      Mevcut Yayını Güncelle
                    </button>
                    <button type="button" onClick={() => handleSaveOption(true)}>
                      Yeni Yayın Oluştur
                    </button>
                  </div>
                  {isNewBroadcast && (
                    <div className="form-group">
                      <label>Yeni Yayın İsmi:</label>
                      <input
                        type="text"
                        name="name"
                        value={newBroadcastName}
                        onChange={(e) => setNewBroadcastName(e.target.value)}
                        placeholder="Yeni yayın ismini girin"
                        required
                      />
                      <div className="save-buttons">
                        <button type="button" onClick={handleSaveChanges} disabled={!newBroadcastName.trim()}>
                          Kaydet
                        </button>
                        <button type="button" onClick={() => {
                          setIsNewBroadcast(false);
                          setShowSaveOptions(false);
                        }}>
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* New Broadcast Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yeni Yayın Oluştur</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(false);
            }} className="broadcast-form">
                <div className="form-group">
                <label>Yayın Adı:</label>
                  <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                <label>Genlik:</label>
                  <input
                    type="number"
                  name="amplitude"
                  value={formData.amplitude}
                  onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                <label>PRI:</label>
                  <input
                    type="number"
                  name="pri"
                  value={formData.pri}
                  onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                <label>Yön:</label>
                  <input
                    type="number"
                  name="direction"
                  value={formData.direction}
                  onChange={handleInputChange}
                    required
                  />
                </div>
              <div className="form-group">
                <label>Pulse Width:</label>
                  <input
                  type="number"
                  name="pulseWidth"
                  value={formData.pulseWidth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="submit"
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Kaydet ve Yayın Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastForm; 