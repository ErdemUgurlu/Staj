import React, { useState, useEffect } from 'react';
import './MessageEditPopup.css';

const MessageEditPopup = ({ message, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    messageName: '',
    messageType: '',
    amplitude: '',
    direction: '',
    pri: '',
    pulseWidth: '',
    yayinId: '',
    sendMessage: false
  });

  useEffect(() => {
    if (message && isOpen) {
      // Parse existing parameters from JSON string
      let parameters = {};
      try {
        if (message.parameters) {
          parameters = JSON.parse(message.parameters);
        }
      } catch (error) {
        console.error('Error parsing message parameters:', error);
      }

      setFormData({
        messageName: message.messageName || '',
        messageType: message.messageType || '',
        amplitude: parameters.amplitude || '',
        direction: parameters.direction || '',
        pri: parameters.pri || '',
        pulseWidth: parameters.pulseWidth || '',
        yayinId: parameters.yayinId || '',
        sendMessage: false
      });
    }
  }, [message, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for API
    const updateData = {
      messageName: formData.messageName,
      messageType: formData.messageType,
      amplitude: formData.amplitude ? parseFloat(formData.amplitude) : null,
      direction: formData.direction ? parseFloat(formData.direction) : null,
      pri: formData.pri ? parseInt(formData.pri) : null,
      pulseWidth: formData.pulseWidth ? parseInt(formData.pulseWidth) : null,
      yayinId: formData.yayinId || null,
      sendMessage: formData.sendMessage
    };

    // Remove null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null || updateData[key] === '') {
        delete updateData[key];
      }
    });

    onSave(message.id, updateData);
  };

  const handleClose = () => {
    setFormData({
      messageName: '',
      messageType: '',
      amplitude: '',
      direction: '',
      pri: '',
      pulseWidth: '',
      yayinId: '',
      sendMessage: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Mesaj Düzenle</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="message-edit-form">
          <div className="form-group">
            <label>Mesaj Adı:</label>
            <input
              type="text"
              name="messageName"
              value={formData.messageName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mesaj Tipi:</label>
            <select
              name="messageType"
              value={formData.messageType}
              onChange={handleInputChange}
              required
            >
              <option value="">Seçiniz</option>
              <option value="yayinEkle">Yayın Ekle</option>
              <option value="yayinBaslat">Yayın Başlat</option>
              <option value="yayinDurdur">Yayın Durdur</option>
              <option value="yayinGuncelle">Yayın Güncelle</option>
              <option value="yayinSil">Yayın Sil</option>
              <option value="yayinGenlikGuncelle">Yayın Genlik Güncelle</option>
              <option value="yayinYonGuncelle">Yayın Yön Güncelle</option>
              <option value="senaryo">Senaryo</option>
            </select>
          </div>

          {(formData.messageType === 'yayinEkle' || formData.messageType === 'yayinGuncelle') && (
            <>
              <div className="form-group">
                <label>Genlik (Amplitude):</label>
                <input
                  type="number"
                  name="amplitude"
                  value={formData.amplitude}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Yön (Direction):</label>
                <input
                  type="number"
                  name="direction"
                  value={formData.direction}
                  onChange={handleInputChange}
                  min="0"
                  max="360"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>PRI:</label>
                <input
                  type="number"
                  name="pri"
                  value={formData.pri}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Pulse Width:</label>
                <input
                  type="number"
                  name="pulseWidth"
                  value={formData.pulseWidth}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Yayın ID:</label>
            <input
              type="text"
              name="yayinId"
              value={formData.yayinId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="sendMessage"
                checked={formData.sendMessage}
                onChange={handleInputChange}
              />
              Mesajı TCP ile gönder
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="cancel-button">
              İptal
            </button>
            <button type="submit" className="save-button">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageEditPopup; 