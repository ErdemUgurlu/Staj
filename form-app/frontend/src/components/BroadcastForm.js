import React, { useState, useEffect } from 'react';
import './Forms.css';

const BroadcastForm = ({ onFormSubmitted }) => {
  const [selectedBroadcasts, setSelectedBroadcasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMultiple, setIsSendingMultiple] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [messages, setMessages] = useState([]); // saved messages
  const [allMessages, setAllMessages] = useState([]); // includes unsaved
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Modal states
  const [isYayinEkleModalOpen, setIsYayinEkleModalOpen] = useState(false);
  const [isYayinBaslatModalOpen, setIsYayinBaslatModalOpen] = useState(false);
  const [isYayinDurdurModalOpen, setIsYayinDurdurModalOpen] = useState(false);
  const [isYayinSilModalOpen, setIsYayinSilModalOpen] = useState(false);
  const [isYayinYonGuncelleModalOpen, setIsYayinYonGuncelleModalOpen] = useState(false);
  const [isYayinGenlikGuncelleModalOpen, setIsYayinGenlikGuncelleModalOpen] = useState(false);
  
  // Form data for yayinEkle message
  const [yayinEkleFormData, setYayinEkleFormData] = useState({
    messageName: '',
    yayinId: '',
    amplitude: 0,
    pri: 0,
    direction: 0,
    pulseWidth: 0,
  });
  
  // Form data for yayinBaslat message
  const [yayinBaslatFormData, setYayinBaslatFormData] = useState({
    messageName: '',
    yayinId: '',
  });

  // Form data for yayinDurdur message
  const [yayinDurdurFormData, setYayinDurdurFormData] = useState({
    messageName: '',
    yayinId: '',
  });

  // Form data for yayinSil message
  const [yayinSilFormData, setYayinSilFormData] = useState({
    messageName: '',
    yayinId: '',
  });

  // Form data for yayinYonGuncelle message
  const [yayinYonGuncelleFormData, setYayinYonGuncelleFormData] = useState({
    messageName: '',
    yayinId: '',
    newDirection: 0,
  });

  // Form data for yayinGenlikGuncelle message
  const [yayinGenlikGuncelleFormData, setYayinGenlikGuncelleFormData] = useState({
    messageName: '',
    yayinId: '',
    newAmplitude: 0,
  });



  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/logs');
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      } else {
        console.error('Error fetching activity logs:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Hata durumunda boş array set et
      setActivityLogs([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/messages');
      if (response.ok) {
        const data = await response.json();
        setAllMessages(data);
        const savedMessages = data.filter(msg => msg.saved);
        setMessages(savedMessages);
      } else {
        console.error('Error fetching messages:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setAllMessages([]);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
    fetchMessages();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  // Extract yayinId from message parameters
  const extractYayinId = (msg) => {
    if (!msg) return undefined;
    // Try to parse parameters JSON safely
    let id;
    try {
      if (msg.parameters) {
        const params = typeof msg.parameters === 'string' ? JSON.parse(msg.parameters) : msg.parameters;
        id = params?.yayinId ?? params?.yayinID ?? params?.yayinid;
      }
    } catch (e) {
      console.warn('Unable to parse message parameters for yayinId:', e);
    }
    // Fallback if backend structure changes in future
    return id ?? msg.yayinId;
  };

  // Check for conflicts: duplicate message name OR same type + yayinId
  const checkMessageNameExists = async (messageName, messageType, yayinId, action) => {
    // Only relevant when saving the message
    if (!(action === 'saveAndSend' || action === 'saveOnly')) return true;

    const duplicateByName = messageName?.trim()
      ? messages.find((msg) => msg.messageName === messageName.trim())
      : undefined;

    const duplicateById = yayinId?.trim()
      ? messages.find(
          (msg) => msg.messageType === messageType && extractYayinId(msg) === yayinId.trim()
        )
      : undefined;

    const duplicates = Array.from(new Set([duplicateByName, duplicateById].filter(Boolean)));
    if (duplicates.length === 0) return true; // no conflicts

    // Build confirmation message
    let confirmMessage = '';
    if (duplicateByName) {
      confirmMessage += `\"${messageName}\" isimli bir mesaj zaten mevcut.`;
    }
    if (duplicateById) {
      confirmMessage += `${confirmMessage ? "\n" : ''}Aynı Yayın ID (${yayinId}) ile kaydedilmiş bir ${messageType} mesajı zaten mevcut.`;
    }
    confirmMessage += '\n\nÜzerine yazmak istediğinizden emin misiniz?\nEvet: Mevcut mesaj(lar) silinir ve yeni mesaj kaydedilir\nHayır: İşlem iptal edilir';

    const confirmOverwrite = window.confirm(confirmMessage);
    if (!confirmOverwrite) return false;

    // Delete duplicates sequentially (could also be Promise.all)
    try {
      for (const dup of duplicates) {
        await fetch(`http://localhost:8080/api/forms/message/${dup.id}`, {
          method: 'DELETE',
        });
      }
      return true;
    } catch (error) {
      console.error('Error deleting existing message(s):', error);
      alert('Mevcut mesaj(lar) silinirken bir hata oluştu: ' + error.message);
      return false;
    }
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

  // Handle YayinEkle form changes
  const handleYayinEkleInputChange = (e) => {
    const { name, value } = e.target;
    setYayinEkleFormData(prev => ({
      ...prev,
      [name]: name === 'messageName' || name === 'yayinId' ? value : Number(value)
    }));
  };

  // Handle YayinBaslat form changes
  const handleYayinBaslatInputChange = (e) => {
    const { name, value } = e.target;
    setYayinBaslatFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle YayinDurdur form changes
  const handleYayinDurdurInputChange = (e) => {
    const { name, value } = e.target;
    setYayinDurdurFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle YayinSil form changes
  const handleYayinSilInputChange = (e) => {
    const { name, value } = e.target;
    setYayinSilFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle YayinYonGuncelle form changes
  const handleYayinYonGuncelleInputChange = (e) => {
    const { name, value } = e.target;
    setYayinYonGuncelleFormData(prev => ({
      ...prev,
      [name]: name === 'messageName' || name === 'yayinId' ? value : Number(value)
    }));
  };

  // Handle YayinGenlikGuncelle form changes
  const handleYayinGenlikGuncelleInputChange = (e) => {
    const { name, value } = e.target;
    setYayinGenlikGuncelleFormData(prev => ({
      ...prev,
      [name]: name === 'messageName' || name === 'yayinId' ? value : Number(value)
    }));
  };

  // Send YayinEkle message
  const handleYayinEkleSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinEkleFormData.messageName || (action === 'sendOnly' ? `YayinEkle-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinEkle', yayinEkleFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinEkle',
        messageName: messageName,
        yayinId: yayinEkleFormData.yayinId,
        amplitude: yayinEkleFormData.amplitude,
        pri: yayinEkleFormData.pri,
        direction: yayinEkleFormData.direction,
        pulseWidth: yayinEkleFormData.pulseWidth,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinEkleModalOpen(false);
        setYayinEkleFormData({
          messageName: '',
          yayinId: '',
          amplitude: 0,
          pri: 0,
          direction: 0,
          pulseWidth: 0,
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinEkle message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send YayinBaslat message
  const handleYayinBaslatSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinBaslatFormData.messageName || (action === 'sendOnly' ? `YayinBaslat-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinBaslat', yayinBaslatFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinBaslat',
        messageName: messageName,
        yayinId: yayinBaslatFormData.yayinId,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinBaslatModalOpen(false);
        setYayinBaslatFormData({
          messageName: '',
          yayinId: '',
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinBaslat message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send YayinDurdur message
  const handleYayinDurdurSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinDurdurFormData.messageName || (action === 'sendOnly' ? `YayinDurdur-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinDurdur', yayinDurdurFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinDurdur',
        messageName: messageName,
        yayinId: yayinDurdurFormData.yayinId,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinDurdurModalOpen(false);
        setYayinDurdurFormData({
          messageName: '',
          yayinId: '',
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinDurdur message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send YayinSil message
  const handleYayinSilSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinSilFormData.messageName || (action === 'sendOnly' ? `YayinSil-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinSil', yayinSilFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinSil',
        messageName: messageName,
        yayinId: yayinSilFormData.yayinId,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinSilModalOpen(false);
        setYayinSilFormData({
          messageName: '',
          yayinId: '',
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinSil message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send YayinYonGuncelle message
  const handleYayinYonGuncelleSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinYonGuncelleFormData.messageName || (action === 'sendOnly' ? `YayinYonGuncelle-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinYonGuncelle', yayinYonGuncelleFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinYonGuncelle',
        messageName: messageName,
        yayinId: yayinYonGuncelleFormData.yayinId,
        newDirection: yayinYonGuncelleFormData.newDirection,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinYonGuncelleModalOpen(false);
        setYayinYonGuncelleFormData({
          messageName: '',
          yayinId: '',
          newDirection: 0,
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinYonGuncelle message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send YayinGenlikGuncelle message
  const handleYayinGenlikGuncelleSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const messageName = yayinGenlikGuncelleFormData.messageName || (action === 'sendOnly' ? `YayinGenlikGuncelle-${Date.now()}` : '');
      
      // Check if message name already exists
      const canProceed = await checkMessageNameExists(messageName, 'yayinGenlikGuncelle', yayinGenlikGuncelleFormData.yayinId, action);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }
      
      const messageData = {
        type: 'yayinGenlikGuncelle',
        messageName: messageName,
        yayinId: yayinGenlikGuncelleFormData.yayinId,
        newAmplitude: yayinGenlikGuncelleFormData.newAmplitude,
        saveMessage: action === 'saveAndSend' || action === 'saveOnly',
        sendMessage: action === 'saveAndSend' || action === 'sendOnly'
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        let alertMessage = '';
        if (action === 'saveAndSend') alertMessage = 'Mesaj kaydedildi ve gönderildi!';
        else if (action === 'saveOnly') alertMessage = 'Mesaj kaydedildi!';
        else alertMessage = 'Mesaj gönderildi!';
        
        alert(alertMessage);
        setIsYayinGenlikGuncelleModalOpen(false);
        setYayinGenlikGuncelleFormData({
          messageName: '',
          yayinId: '',
          newAmplitude: 0,
        });
        
        // Refresh messages if saved
        await fetchMessages();
        
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending yayinGenlikGuncelle message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Send saved message that wasn't sent before
  const handleSendSavedMessage = async (message) => {
    setIsSubmitting(true);
    try {
      // First, update the message as sent in the database
      const updateResponse = await fetch(`http://localhost:8080/api/forms/message/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          sent: true
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update message status');
      }

      // Then send the actual message via TCP
      const messageData = {
        ...JSON.parse(message.parameters || '{}'),
        type: message.messageType,
        messageName: message.messageName,
        saveMessage: false, // Don't save again, just send
        sendMessage: true   // Only send via TCP
      };

      const response = await fetch('http://localhost:8080/api/forms/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        alert('Mesaj TCP üzerinden gönderildi!');
        await fetchMessages(); // Refresh to update sent status
        if (onFormSubmitted) onFormSubmitted();
      } else {
        const errorText = await response.text();
        alert('Mesaj gönderilirken bir hata oluştu: ' + errorText);
      }
    } catch (error) {
      console.error('Error sending saved message:', error);
      alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedBroadcasts.length === 0) return;
    
    if (!window.confirm(`${selectedBroadcasts.length} mesajı silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    setIsSendingMultiple(true);
    try {
      const promises = selectedBroadcasts.map(async id => {
        await fetch(`http://localhost:8080/api/forms/message/${id}`, {
          method: 'DELETE',
        });
      });
      
      await Promise.all(promises);
      await fetchMessages();
      setSelectedBroadcasts([]);
      if (onFormSubmitted) onFormSubmitted();
    } catch (error) {
      console.error('Error deleting selected messages:', error);
      alert('Mesajlar silinirken bir hata oluştu: ' + error.message);
    }
    setIsSendingMultiple(false);
  };

  // Determine if send button should be shown based on antagonist logic
  const shouldShowSendButton = (msg) => {
    const pairs = {
      yayinEkle: { counter: 'yayinSil', isStart: true },
      yayinSil: { counter: 'yayinEkle', isStart: false },
      yayinBaslat: { counter: 'yayinDurdur', isStart: true },
      yayinDurdur: { counter: 'yayinBaslat', isStart: false }
    };

    const pairInfo = pairs[msg.messageType];
    if (!pairInfo) {
      // For message types outside our pairs keep default logic: show if not sent
      return !msg.sent;
    }

    // Extract yayinId safely
    let id;
    try {
      id = JSON.parse(msg.parameters || '{}')?.yayinId;
    } catch {
      id = undefined;
    }
    if (!id) return !msg.sent; // if no id behave default

    // Helper to parse id from any message
    const getYayinId = (m) => {
      try {
        return JSON.parse(m.parameters || '{}')?.yayinId;
      } catch {
        return undefined;
      }
    };

    // Gather all messages of this pair with same id and sent===true
    const relevantSent = allMessages.filter(
      (m) => (m.messageType === msg.messageType || m.messageType === pairInfo.counter) && m.sent && getYayinId(m) === id
    );

    // Determine the latest sent message among the pair
    let latestSent = null;
    for (const m of relevantSent) {
      if (!latestSent || new Date(m.createdAt) > new Date(latestSent.createdAt)) {
        latestSent = m;
      }
    }

    // Case 1: message not sent yet
    if (!msg.sent) {
      if (!latestSent) {
        // No message sent yet. Allow start type, block stop type
        return pairInfo.isStart;
      }
      // There is a sent counterpart
      // Allow sending if latest sent is of opposite type to current message
      return latestSent.messageType !== msg.messageType;
    }

    // Case 2: message was sent previously
    if (msg.sent) {
      if (!latestSent) return true; // Should not happen, but keep safe
      // Show button if this sent message is NOT the latest one anymore
      return latestSent.id !== msg.id;
    }

    return false;
  };

  return (
    <div className="broadcast-container">
      <div className="broadcasts-header">
        <h2>Kayıtlı Mesajlar ({messages.length})</h2>
        <div className="header-buttons">
          <div className="dropdown-container">
            <button 
              className="dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Yayın ▼
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item yayin-ekle-color"
                  onClick={() => {
                    setIsYayinEkleModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  📡 Yayın Ekle Mesajı
                </button>
                <button 
                  className="dropdown-item yayin-baslat-color"
                  onClick={() => {
                    setIsYayinBaslatModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  ▶️ Yayın Başlat Mesajı
                </button>
                <button 
                  className="dropdown-item yayin-durdur-color"
                  onClick={() => {
                    setIsYayinDurdurModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  ⏹️ Yayın Durdur Mesajı
                </button>
                <button 
                  className="dropdown-item yayin-sil-color"
                  onClick={() => {
                    setIsYayinSilModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  🗑️ Yayın Sil Mesajı
                </button>
                <button 
                  className="dropdown-item yayin-yon-guncelle-color"
                  onClick={() => {
                    setIsYayinYonGuncelleModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  🧭 Yön Güncelle Mesajı
                </button>
                <button 
                  className="dropdown-item yayin-genlik-guncelle-color"
                  onClick={() => {
                    setIsYayinGenlikGuncelleModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  📶 Genlik Güncelle Mesajı
                </button>
              </div>
            )}
          </div>
          <button 
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
            disabled={selectedBroadcasts.length === 0 || isSendingMultiple}
          >
            {isSendingMultiple ? 'Siliniyor...' : `Mesaj Sil (${selectedBroadcasts.length})`}
          </button>
        </div>
      </div>

      <div className="broadcasts-list">
        {messages.map((message) => {
          const creationDate = new Date(message.createdAt).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          let parameters = {};
          try {
            parameters = JSON.parse(message.parameters || '{}');
          } catch (e) {
            console.warn('Error parsing message parameters for message:', message.id, e);
            parameters = {};
          }
          
          return (
            <div key={message.id} className={`broadcast-item ${message.sent ? 'sent' : 'not-sent'}`}>
              <div className="broadcast-info">
                <input
                  type="checkbox"
                  className="broadcast-checkbox"
                  checked={selectedBroadcasts.includes(message.id)}
                  onChange={() => handleCheckboxChange(message.id)}
                />
                <span className="broadcast-name">{message.messageName}</span>
                <span className="broadcast-params">
                  Tip: {message.messageType}
                  {parameters.amplitude && ` | Genlik: ${parameters.amplitude}`}
                  {parameters.pri && ` | PRI: ${parameters.pri}`}
                  {parameters.direction && ` | Yön: ${parameters.direction}`}
                  {parameters.pulseWidth && ` | Pulse Width: ${parameters.pulseWidth}`}
                  {parameters.yayinId && ` | Yayın ID: ${parameters.yayinId}`}
                  {parameters.newDirection && ` | Yeni Yön: ${parameters.newDirection}`}
                  {parameters.newAmplitude && ` | Yeni Genlik: ${parameters.newAmplitude}`}
                </span>
                <div className="broadcast-status">
                  <span className="broadcast-date">{creationDate}</span>
                  <span className={`status-badge ${message.sent ? 'sent' : 'not-sent'}`}>
                    {message.sent ? 'TCP Gönderildi' : 'TCP Gönderilmedi'}
                  </span>
                  {!message.sent && shouldShowSendButton(message) && (
                    <button 
                      className="send-saved-message-btn"
                      onClick={() => handleSendSavedMessage(message)}
                      disabled={isSubmitting}
                    >
                      Gönder
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* YayinEkle Modal */}
      {isYayinEkleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Ekle Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinEkleModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinEkleFormData.messageName}
                  onChange={handleYayinEkleInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinEkleFormData.yayinId}
                  onChange={handleYayinEkleInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Genlik:</label>
                <input
                  type="number"
                  name="amplitude"
                  value={yayinEkleFormData.amplitude}
                  onChange={handleYayinEkleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>PRI:</label>
                <input
                  type="number"
                  name="pri"
                  value={yayinEkleFormData.pri}
                  onChange={handleYayinEkleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Yön:</label>
                <input
                  type="number"
                  name="direction"
                  value={yayinEkleFormData.direction}
                  onChange={handleYayinEkleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pulse Width:</label>
                <input
                  type="number"
                  name="pulseWidth"
                  value={yayinEkleFormData.pulseWidth}
                  onChange={handleYayinEkleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinEkleSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinEkleFormData.messageName.trim() || !yayinEkleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinEkleSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinEkleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinEkleSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinEkleFormData.messageName.trim() || !yayinEkleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinEkleModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YayinBaslat Modal */}
      {isYayinBaslatModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Başlat Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinBaslatModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinBaslatFormData.messageName}
                  onChange={handleYayinBaslatInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinBaslatFormData.yayinId}
                  onChange={handleYayinBaslatInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinBaslatSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinBaslatFormData.messageName.trim() || !yayinBaslatFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinBaslatSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinBaslatFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinBaslatSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinBaslatFormData.messageName.trim() || !yayinBaslatFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinBaslatModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YayinDurdur Modal */}
      {isYayinDurdurModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Durdur Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinDurdurModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinDurdurFormData.messageName}
                  onChange={handleYayinDurdurInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinDurdurFormData.yayinId}
                  onChange={handleYayinDurdurInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinDurdurSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinDurdurFormData.messageName.trim() || !yayinDurdurFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinDurdurSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinDurdurFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinDurdurSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinDurdurFormData.messageName.trim() || !yayinDurdurFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinDurdurModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YayinSil Modal */}
      {isYayinSilModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Sil Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinSilModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinSilFormData.messageName}
                  onChange={handleYayinSilInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinSilFormData.yayinId}
                  onChange={handleYayinSilInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinSilSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinSilFormData.messageName.trim() || !yayinSilFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinSilSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinSilFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinSilSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinSilFormData.messageName.trim() || !yayinSilFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinSilModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YayinYonGuncelle Modal */}
      {isYayinYonGuncelleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Yön Güncelle Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinYonGuncelleModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinYonGuncelleFormData.messageName}
                  onChange={handleYayinYonGuncelleInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinYonGuncelleFormData.yayinId}
                  onChange={handleYayinYonGuncelleInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yeni Yön:</label>
                <input
                  type="number"
                  name="newDirection"
                  value={yayinYonGuncelleFormData.newDirection}
                  onChange={handleYayinYonGuncelleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinYonGuncelleSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinYonGuncelleFormData.messageName.trim() || !yayinYonGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinYonGuncelleSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinYonGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinYonGuncelleSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinYonGuncelleFormData.messageName.trim() || !yayinYonGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinYonGuncelleModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YayinGenlikGuncelle Modal */}
      {isYayinGenlikGuncelleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yayın Genlik Güncelle Mesajı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsYayinGenlikGuncelleModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="broadcast-form">
              <div className="form-group">
                <label>Mesaj İsmi:</label>
                <input
                  type="text"
                  name="messageName"
                  value={yayinGenlikGuncelleFormData.messageName}
                  onChange={handleYayinGenlikGuncelleInputChange}
                  placeholder="Mesaj ismini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yayın ID:</label>
                <input
                  type="text"
                  name="yayinId"
                  value={yayinGenlikGuncelleFormData.yayinId}
                  onChange={handleYayinGenlikGuncelleInputChange}
                  placeholder="Yayın ID'sini girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Yeni Genlik:</label>
                <input
                  type="number"
                  name="newAmplitude"
                  value={yayinGenlikGuncelleFormData.newAmplitude}
                  onChange={handleYayinGenlikGuncelleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="save-and-send-btn"
                  onClick={() => handleYayinGenlikGuncelleSubmit('saveAndSend')}
                  disabled={isSubmitting || !yayinGenlikGuncelleFormData.messageName.trim() || !yayinGenlikGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Kaydet ve Gönder'}
                </button>
                <button 
                  type="button"
                  className="send-only-btn"
                  onClick={() => handleYayinGenlikGuncelleSubmit('sendOnly')}
                  disabled={isSubmitting || !yayinGenlikGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Gönder'}
                </button>
                <button 
                  type="button"
                  className="save-only-btn"
                  onClick={() => handleYayinGenlikGuncelleSubmit('saveOnly')}
                  disabled={isSubmitting || !yayinGenlikGuncelleFormData.messageName.trim() || !yayinGenlikGuncelleFormData.yayinId.trim()}
                >
                  {isSubmitting ? 'İşleniyor...' : 'Yalnızca Kaydet'}
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsYayinGenlikGuncelleModalOpen(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastForm;